'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [links, setLinks] = useState([]);
  const [destination, setDestination] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');

  async function loadLinks() {
    try {
      const res = await fetch('/api/links', {
        cache: 'no-store'
      });

      const data = await res.json();
      setLinks(data.links || []);
    } catch {
      setMessage('Database is not connected yet.');
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function createLink(e) {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destination,
          slug
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Could not create link.');
        return;
      }

      setDestination('');
      setSlug('');
      setMessage(`Created: ${data.url}`);

      loadLinks();
    } catch {
      setMessage('Something went wrong.');
    }
  }

  async function deleteLink(slugToDelete) {
    await fetch(
      `/api/links?slug=${encodeURIComponent(slugToDelete)}`,
      {
        method: 'DELETE'
      }
    );

    loadLinks();
  }

  return (
    <main className="wrap">
      <section className="hero">
        <div className="eyebrow">
          SHORTLINK V2
        </div>

        <h1>
          Your branded link dashboard
        </h1>

        <p>
          Create, manage and track transparent
          short links for your own domain.
        </p>
      </section>

      <section className="card">
        <h2>Create a link</h2>

        <form onSubmit={createLink}>
          <label>
            Destination URL
          </label>

          <input
            type="url"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
            placeholder="https://example.com/page"
            required
          />

          <label>
            Custom short code (optional)
          </label>

          <input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value)
            }
            placeholder="offer"
          />

          <button type="submit">
            Create short link
          </button>
        </form>

        {message && (
          <div className="notice">
            {message}
          </div>
        )}
      </section>

      <section className="card">
        <div className="rowTitle">
          <h2>Your links</h2>

          <button
            type="button"
            className="secondary"
            onClick={loadLinks}
          >
            Refresh
          </button>
        </div>

        {links.length === 0 ? (
          <p className="muted">
            No links yet.
          </p>
        ) : (
          <div className="list">
            {links.map((link) => (
              <div
                className="link"
                key={link.slug}
              >
                <div className="linkMain">
                  <strong>
                    {link.slug}
                  </strong>

                  <span>
                    {link.destination}
                  </span>

                  <small>
                    {link.clicks || 0} clicks
                  </small>
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        link.url
                      )
                    }
                  >
                    Copy
                  </button>

                  <a
                    className="aBtn secondary"
                    href={`/go/${encodeURIComponent(
                      link.slug
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      deleteLink(link.slug)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="foot">
        Transparent redirect system for your
        own links.
      </p>
    </main>
  );
}
