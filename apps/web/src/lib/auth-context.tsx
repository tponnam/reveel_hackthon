"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User,
    updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "user" | "admin";

export type OrgRole = "owner" | "admin" | "member";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: UserRole;
    isAdmin: boolean;
    status: "pending" | "approved" | "rejected";
    orgId: string | null;
    orgRole: OrgRole | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, inviteId?: string) => Promise<void>;
    signInWithGoogle: (inviteId?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<UserRole>("user");
    const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
    const [orgId, setOrgId] = useState<string | null>(null);
    const [orgRole, setOrgRole] = useState<OrgRole | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setRole((data.role as UserRole) || "user");
                        setStatus(data.status || "pending");
                        setOrgId(data.orgId || null);
                        setOrgRole(data.orgRole || null);
                    }
                } catch {
                    setRole("user");
                    setStatus("pending");
                    setOrgId(null);
                    setOrgRole(null);
                }
            } else {
                setRole("user");
                setStatus("pending");
                setOrgId(null);
                setOrgRole(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, name: string, inviteId?: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });

        let finalOrgId = "";
        let finalOrgRole: OrgRole = "owner";

        if (inviteId) {
            try {
                const inviteDoc = await getDoc(doc(db, "invites", inviteId));
                if (inviteDoc.exists() && inviteDoc.data().status === "pending") {
                    finalOrgId = inviteDoc.data().orgId;
                    finalOrgRole = inviteDoc.data().role as OrgRole || "member";
                    await updateDoc(doc(db, "invites", inviteId), { status: "accepted" });
                }
            } catch (err) { console.error("Failed to process invite", err); }
        }

        if (!finalOrgId) {
            const orgRef = doc(collection(db, "organizations"));
            finalOrgId = orgRef.id;
            await setDoc(orgRef, {
                name: `${name}'s Workspace`,
                plan: "free",
                createdAt: serverTimestamp(),
            });
            finalOrgRole = "owner";
        }

        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email,
            name,
            role: "user",
            status: "pending",
            orgId: finalOrgId,
            orgRole: finalOrgRole,
            plan: "free",
            usage: { aiMinutes: 0, demosGenerated: 0 },
            createdAt: serverTimestamp(),
        });
    };

    const signInWithGoogle = async (inviteId?: string) => {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);

        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        if (!userDoc.exists()) {
            let finalOrgId = "";
            let finalOrgRole: OrgRole = "owner";

            if (inviteId) {
                try {
                    const inviteDoc = await getDoc(doc(db, "invites", inviteId));
                    if (inviteDoc.exists() && inviteDoc.data().status === "pending") {
                        finalOrgId = inviteDoc.data().orgId;
                        finalOrgRole = inviteDoc.data().role as OrgRole || "member";
                        await updateDoc(doc(db, "invites", inviteId), { status: "accepted" });
                    }
                } catch (err) { console.error("Failed to process invite", err); }
            }

            const name = cred.user.displayName || "User";
            if (!finalOrgId) {
                const orgRef = doc(collection(db, "organizations"));
                finalOrgId = orgRef.id;
                await setDoc(orgRef, {
                    name: `${name}'s Workspace`,
                    plan: "free",
                    createdAt: serverTimestamp(),
                });
                finalOrgRole = "owner";
            }

            await setDoc(doc(db, "users", cred.user.uid), {
                uid: cred.user.uid,
                email: cred.user.email,
                name,
                role: "user",
                status: "pending",
                orgId: finalOrgId,
                orgRole: finalOrgRole,
                plan: "free",
                usage: { aiMinutes: 0, demosGenerated: 0 },
                createdAt: serverTimestamp(),
            });
        } else {
            const data = userDoc.data();
            setRole((data.role as UserRole) || "user");
            setStatus(data.status || "pending");
            setOrgId(data.orgId || null);
            setOrgRole(data.orgRole || null);
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setRole("user");
        setStatus("pending");
        setOrgId(null);
        setOrgRole(null);
    };

    const isAdmin = role === "admin";

    return (
        <AuthContext.Provider value={{ user, loading, role, isAdmin, status, orgId, orgRole, signIn, signUp, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
