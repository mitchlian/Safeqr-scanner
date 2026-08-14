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
        .select("id, url");

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Count how many times each URL appears
      const urlCounts = {};

      data.forEach(site => {
        if (urlCounts[site.url]) {
          urlCounts[site.url]++;
        } else {
          urlCounts[site.url] = 1;
        }
      });

      // Convert object into an array
      const groupedSites = Object.entries(urlCounts)
        .map(([url, count]) => ({
          url,
          count
        }))
        // Most reported first
        .sort((a, b) => b.count - a.count)
        // Maximum of 10 links
        .slice(0, 10);

      setSites(groupedSites);
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
        <div className="site-row" key={site.url}>

          <span>{site.url}</span>

          <span>
            {site.count} report{site.count === 1 ? "" : "s"}
          </span>

        </div>
      ))}

    </div>
  );
}

export default KnownMaliciousSites;
