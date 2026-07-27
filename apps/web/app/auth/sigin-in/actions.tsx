"use server"

export async function signInWithEmailAndPassword(data: FormData) {
    console.log("signInWithEmailAndPassword", Object.fromEntries(data))
}