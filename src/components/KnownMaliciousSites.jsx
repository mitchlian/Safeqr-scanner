import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function KnownMaliciousSites() {

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchSites = async () => {

      const { data, error } = await supabase
        .from("blacklist")
        .select("id, url")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setSites(data);
      }

      setLoading(false);
    };

    fetchSites();
  }, []);

  return (
    <div className="malicious-sites">

        <h1>Known Malicious Sites</h1>

        {loading && <p>Loading...</p>}

        {error && <p className="form-error">{error}</p>}

        {!loading && !error && sites.length === 0 && (
          <p>No known malicious sites yet.</p>
        )}

        {sites.map((site) => (
        <div className="site-row" key={site.id}>
            {site.url}
        </div>
        ))}

    </div>
  );
}

export default KnownMaliciousSites;
