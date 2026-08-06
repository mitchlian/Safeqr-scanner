import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function Blacklist({ refreshKey, onChanged }) {

    const [blacklist, setBlacklist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [urlInput, setUrlInput] = useState("");
    const [reasonInput, setReasonInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchBlacklist = async () => {

        const { data, error } = await supabase
            .from("blacklist")
            .select("id, url, reason, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setBlacklist(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        const load = async () => { await fetchBlacklist(); };
        load();
    }, [refreshKey]);

    const handleAdd = async () => {

        if (!urlInput.trim()) {
            setFormError("Enter a URL or domain pattern.");
            return;
        }

        setFormError("");
        setSubmitting(true);

        const { error } = await supabase.from("blacklist").insert([{
            url: urlInput.trim(),
            reason: reasonInput.trim() || null,
        }]);

        setSubmitting(false);

        if (error) {
            setFormError(error.message);
            return;
        }

        setUrlInput("");
        setReasonInput("");
        fetchBlacklist();
        onChanged?.();
    };

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return blacklist;
        return blacklist.filter((entry) => entry.url.toLowerCase().includes(term));
    }, [blacklist, search]);

    return (

        <div>

            <p className="admin-subtitle">{blacklist.length} rule{blacklist.length === 1 ? "" : "s"} active</p>

            <div className="blacklist-add-form">

                <input
                    type="text"
                    placeholder="Pattern (e.g. evil.com)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="blacklist-url-input"
                />

                <input
                    type="text"
                    placeholder="Reason (optional)"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    className="blacklist-reason-input"
                />

                <button onClick={handleAdd} disabled={submitting}>
                    {submitting ? "Adding..." : "Add Rule"}
                </button>

            </div>

            {formError && <p className="form-error">{formError}</p>}

            <input
                type="text"
                placeholder="Search patterns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search blacklist-search"
            />

            {loading && <p>Loading...</p>}

            {error && <p className="form-error">{error}</p>}

            {!loading && !error && filtered.length === 0 && (
                <p className="chart-empty">No blacklisted URLs yet.</p>
            )}

            {filtered.map((entry) => (

                <div
                    className="admin-row"
                    key={entry.id}
                >
                    <div>
                        <strong>{entry.url}</strong>
                        {entry.reason && <p className="blacklist-reason">{entry.reason}</p>}
                    </div>

                    <span className="scan-logs-time">{new Date(entry.created_at).toLocaleDateString()}</span>
                </div>

            ))}

        </div>
    );
}

export default Blacklist;
