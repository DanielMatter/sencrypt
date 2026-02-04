import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { createUser, deleteUser } from "../actions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "admin") {
        redirect("/dashboard");
    }

    const allUsers = await db.select().from(users).all();

    const updateCanReceiveAction = async (userId: string, canReceive: boolean) => {
        "use server";
        await db.update(users).set({ canReceive }).where(eq(users.id, userId));
        revalidatePath("/admin");
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white mb-8">Admin Dashboard</h1>

            <div className="bg-white/5 shadow ring-1 ring-white/10 sm:rounded-lg p-6 mb-8">
                <h2 className="text-base font-semibold leading-7 text-white mb-4">Create New User</h2>
                <form action={async (formData) => {
                    "use server";
                    const name = formData.get("name") as string;
                    const email = formData.get("email") as string;
                    const canReceive = formData.get("canReceive") === "on";
                    await createUser({ name, email, canReceive });
                }} className="space-y-4 md:flex md:space-x-4 md:space-y-0 md:items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium leading-6 text-zinc-300">Name</label>
                        <input name="name" type="text" required className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-3" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium leading-6 text-zinc-300">Email</label>
                        <input name="email" type="email" required className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-3" />
                    </div>
                    <div className="flex items-center h-full pb-2">
                        <input id="canReceive" name="canReceive" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        <label htmlFor="canReceive" className="ml-2 block text-sm text-zinc-300">Can Receive Files</label>
                    </div>
                    <button type="submit" className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Create</button>
                </form>
            </div>

            <div className="bg-white/5 shadow ring-1 ring-white/10 sm:rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Email</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Role</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Can Receive</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-transparent">
                        {allUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{user.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">{user.email}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">{user.role}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                                    <form action={async () => {
                                        "use server";
                                        await updateCanReceiveAction(user.id, !user.canReceive);
                                    }}>
                                        <button type="submit" className="text-zinc-300 hover:text-white">{user.canReceive ? 'Yes' : 'No'}</button>
                                    </form>
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <form action={async () => {
                                        "use server";
                                        await deleteUser(user.id);
                                    }}>
                                        <button type="submit" className="text-red-400 hover:text-red-300">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
