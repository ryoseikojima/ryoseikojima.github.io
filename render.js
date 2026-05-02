// Site renderer - reads data.json and populates each section.
// Set window.SITE_LANG = "ja" or "en" before loading this file.

(function () {
    const lang = window.SITE_LANG || "ja";
    const dataUrl = window.DATA_URL || "data.json";

    function pick(obj, base) {
        return obj[base + "_" + lang] ?? obj[base] ?? "";
    }

    function mdBold(text) {
        return (text || "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }

    function setText(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function renderProfile(d) {
        document.title = lang === "ja"
            ? `${d.profile.name_ja} | ${d.profile.name_en}`
            : d.profile.name_en;
        setText("profile-name", pick(d.profile, "name"));
        setText("profile-subname", pick(d.profile, "subname"));
        setText("profile-affiliation", pick(d.profile, "affiliation"));
        setText("profile-tagline", pick(d.profile, "tagline"));
        const img = document.getElementById("profile-image");
        if (img) {
            img.src = (lang === "en" ? "../" : "") + d.profile.image;
            img.alt = pick(d.profile, "name");
        }
    }

    function renderAbout(d) {
        const text = lang === "ja" ? d.about_ja : d.about_en;
        setText("about-text", text);
        setText("section-about", lang === "ja" ? "About" : "About");
        setText("section-education", lang === "ja" ? "学歴" : "Education");
    }

    function renderEducation(d) {
        const html = d.education.map(e => `
            <div class="timeline-item">
                <span class="timeline-date">${pick(e, "date")}</span>
                <div class="timeline-content">${pick(e, "content")}</div>
            </div>
        `).join("");
        setText("education-timeline", html);
    }

    function renderResearch(d) {
        setText("section-research", lang === "ja" ? "Research" : "Research");
        const html = d.research_projects.map(p => {
            const title = pick(p, "title");
            const titleHtml = p.url
                ? `<a href="${p.url}" target="_blank">${title}</a>`
                : title;
            return `
                <div class="project">
                    <div class="project-info">
                        <h3>${titleHtml}</h3>
                        <span class="project-meta">${pick(p, "meta")}</span>
                        <p>${pick(p, "description")}</p>
                    </div>
                    <div class="project-media">
                        <div class="video-embed">
                            <iframe src="https://www.youtube.com/embed/${p.video_id}" title="${pick(p, "title")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>`;
        }).join("");
        setText("research-list", html);
    }

    function renderPubItem(p) {
        const authors = mdBold(pick(p, "authors"));
        const title = pick(p, "title") || p.title;
        const venue = pick(p, "venue");
        const doiHtml = p.doi
            ? ` <a href="https://doi.org/${p.doi}" target="_blank">DOI</a>`
            : "";
        const urlHtml = p.url && !p.doi
            ? ` <a href="${p.url}" target="_blank">Link</a>`
            : "";
        const titleStr = title ? `"${title}" ` : "";
        return `<li>${authors} ${titleStr}${venue}${doiHtml}${urlHtml}</li>`;
    }

    function renderPublications(d) {
        const labels = lang === "ja"
            ? { title: "Publications", first: "主著", co: "共著", domestic: "国内学会発表", patents: "特許" }
            : { title: "Publications", first: "First Author", co: "Co-Author", domestic: "Domestic Conference", patents: "Patents" };
        setText("section-publications", labels.title);
        setText("h3-first", labels.first);
        setText("h3-co", labels.co);
        setText("h3-domestic", labels.domestic);
        setText("h3-patents", labels.patents);

        setText("pub-first", d.publications.first_author.map(renderPubItem).join(""));
        const coStart = d.publications.first_author.length + 1;
        document.getElementById("pub-co")?.setAttribute("start", coStart);
        setText("pub-co", d.publications.co_author.map(renderPubItem).join(""));
        const domStart = coStart + d.publications.co_author.length;
        document.getElementById("pub-domestic")?.setAttribute("start", domStart);
        setText("pub-domestic", d.publications.domestic.map(renderPubItem).join(""));

        setText("patents-list", d.patents.map(p => `<li>${pick(p, "text")}</li>`).join(""));
    }

    function renderAwardGroup(items) {
        return items.map(a => `
            <div class="award-item">
                <span class="award-date">${a.date}</span>
                <div>${pick(a, "content")}</div>
            </div>
        `).join("");
    }

    function renderAwards(d) {
        const labels = lang === "ja"
            ? { title: "Awards & Funding", funding: "助成金・奨学金", honors: "受賞歴", ta: "ティーチング・アシスタント（TA）", ra: "リサーチ・アシスタント（RA）", other: "その他の活動" }
            : { title: "Awards & Funding", funding: "Grants & Scholarships", honors: "Awards", ta: "Teaching Assistant (TA)", ra: "Research Assistant (RA)", other: "Other Activities" };
        setText("section-awards", labels.title);
        setText("h3-funding", labels.funding);
        setText("h3-honors", labels.honors);
        setText("h3-ta", labels.ta);
        setText("h3-ra", labels.ra);
        setText("h3-other", labels.other);

        setText("awards-funding", renderAwardGroup(d.awards.funding));
        setText("awards-honors", renderAwardGroup(d.awards.honors));
        setText("awards-ta", renderAwardGroup(d.awards.ta));
        setText("awards-ra", renderAwardGroup(d.awards.ra));
        setText("awards-other", renderAwardGroup(d.awards.other));
    }

    function renderSkills(d) {
        setText("section-skills", "Skills");
        const html = d.skills.map(s => {
            const cat = pick(s, "category");
            const items = s["items_" + lang] ?? s.items ?? "";
            return `<div class="skill-item"><strong>${cat}</strong><br>${items}</div>`;
        }).join("");
        setText("skills-grid", html);
    }

    function renderContact(d) {
        setText("section-contact", "Contact");
        const emailEl = document.getElementById("email-display");
        if (emailEl) {
            emailEl.innerHTML = d.contact.emails.join("<br>");
        }
        const linksHtml = d.contact.links.map(l => {
            const url = l["url_" + lang] ?? l.url;
            const label = l["label_" + lang] ?? l.label;
            return `<a href="${url}" target="_blank">${label}</a>`;
        }).join("");
        setText("contact-links", linksHtml);
    }

    function renderFooter(d) {
        setText("footer-text", `&copy; ${d.footer_year} Ryosei Kojima`);
    }

    fetch(dataUrl)
        .then(r => r.json())
        .then(d => {
            renderProfile(d);
            renderAbout(d);
            renderEducation(d);
            renderResearch(d);
            renderPublications(d);
            renderAwards(d);
            renderSkills(d);
            renderContact(d);
            renderFooter(d);
        })
        .catch(err => {
            console.error("Failed to load data.json:", err);
            const main = document.querySelector("main") || document.body;
            main.insertAdjacentHTML("afterbegin",
                `<div style="padding:2em;color:#c00;">Failed to load site data: ${err.message}</div>`);
        });
})();
