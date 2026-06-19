function Blacklist() {

    const blacklist = [

        "https://fake-bank-login.com",
        "https://free-iphone-prize.com",
        "https://paypal-security-check.com"

    ];

    return (

        <div>

            <h1>Blacklist</h1>

            {blacklist.map((url, index) => (

                <div
                    className="admin-row"
                    key={index}
                >
                    <strong>{url}</strong>

                </div>

            ))}

        </div>
    );
}

export default Blacklist;