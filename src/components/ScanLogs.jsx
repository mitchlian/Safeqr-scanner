function ScanLogs() {

    const logs = [

        {
            id: 1,
            url: "https://google.com",
            safe: true,
            time: "19 Jun 2026 10:20 AM"
        },

        {
            id: 2,
            url: "https://fake-bank-login.com",
            safe: false,
            time: "19 Jun 2026 10:25 AM"
        },

        {
            id: 3,
            url: "https://youtube.com",
            safe: true,
            time: "19 Jun 2026 10:30 AM"
        }

    ];

    return (

        <div>

            <h1>Scan Logs</h1>

            {logs.map(log => (

                <div className="admin-row" key={log.id}>

                    <div>

                        <strong>{log.url}</strong>

                        <p>{log.time}</p>

                    </div>

                    <div>

                        {log.safe ? "Safe" : "Unsafe"}

                    </div>

                </div>

            ))}

        </div>
    );
}

export default ScanLogs;