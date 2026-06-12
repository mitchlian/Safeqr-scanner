function KnownMaliciousSites() {

  const maliciousSites = [
    "fake-paypal-login.com",
    "secure-bank-update.net",
    "freegiftcard.xyz",
    "verify-account-now.info",
    "login-amazon-security.com"
  ];

  return (
    <div className="malicious-sites">

        <h1>Known Malicious Sites</h1>

        {maliciousSites.map((site) => (
        <div className="site-row" key={site}>
            {site}
        </div>
        ))}

    </div>
  );
}

export default KnownMaliciousSites;