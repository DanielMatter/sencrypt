export default function SendInfoPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Send a File</h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                To send a file to a user, you must visit their personal Receive Link.
                <br /><br />
                Ask the recipient for their URL (e.g. <code>/r/their-user-id</code>).
            </p>
        </div>
    )
}
