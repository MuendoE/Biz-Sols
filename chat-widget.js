/* Alpha CR Solutions — self-contained FAQ assistant widget.
   No backend, no third-party calls. Injects its own styles + DOM + logic.
   Knowledge base is built from the site's own content. */
(function () {
  "use strict";

  // ---- Knowledge base ---------------------------------------------------
  var KB = {
    gcp: {
      label: "GCP Training",
      answer: "Our Good Clinical Practice Course (ICH E6(R3)) is TransCelerate mutually recognised and listed on the Shared Investigator Platform (SIP). It's delivered three ways — self-paced on our LMS, in-person at your site, or live online over Teams. Every participant receives a certificate of completion and TMF-ready training records.",
      links: [["View GCP Training", "gcp-training.html"], ["Enrol on the LMS", "https://learn.alphacrsolutions.co.za"]],
      next: ["transcelerate", "enrol", "craTraining", "contact"]
    },
    transcelerate: {
      label: "TransCelerate recognition",
      answer: "Yes — our Good Clinical Practice Course (ICH E6(R3)) is mutually recognised under the TransCelerate GCP Training Mutual Recognition Programme and is uploaded to the Shared Investigator Platform (SIP). That means a GCP certificate earned through this course is accepted across TransCelerate member companies and investigator sites, so your team won't need to repeat GCP training when joining their trials.",
      links: [["GCP Training", "gcp-training.html"], ["View the TransCelerate listing", "https://www.transcelerate-gcp-mutual-recognition.com/view-course"]],
      next: ["enrol", "gcp", "contact"]
    },
    cra: {
      label: "CRA & Monitoring",
      answer: "We provide experienced CRAs and full site monitoring — source data verification (SDV), source data review (SDR) and risk-based monitoring to ICH E6(R3) standards, with inspection-ready documentation throughout.",
      links: [["CRA & Monitoring", "cra-monitoring.html"]],
      next: ["craTraining", "regulatory", "contact"]
    },
    craTraining: {
      label: "CRA Training",
      answer: "We build CRA competency through real-site shadowing and online monitoring simulations, plus patient engagement and recruitment support to keep enrolment on track.",
      links: [["CRA Training & Simulations", "cra-training.html"]],
      next: ["gcp", "enrol", "contact"]
    },
    regulatory: {
      label: "Regulatory / SAHPRA",
      answer: "We manage the full regulatory and ethics lifecycle: SAHPRA Clinical Trial Applications, amendments and safety reports; NHREC-registered IRB and site IEC ethics submissions; and protocol & ICF development.",
      links: [["Regulatory Consultancy", "regulatory-consultancy.html"]],
      next: ["startup", "contact"]
    },
    startup: {
      label: "Study Start-up",
      answer: "Our study start-up support covers MTAs, import/export permits, vendor assessments, source data templates and SOP development — everything needed to activate your sites.",
      links: [["Study Start-up & Site Support", "study-startup.html"]],
      next: ["regulatory", "contact"]
    },
    software: {
      label: "Software",
      answer: "We build clinical research software — patient-matching systems, recruitment dashboards and custom data tools for sponsors, CROs and sites.",
      links: [["Software Solutions", "software.html"]],
      next: ["contact"]
    },
    enrol: {
      label: "How to enrol",
      answer: "Enrolling is simple: (1) create a free account at learn.alphacrsolutions.co.za, (2) email enrolments@alphacrsolutions.co.za with the course you want and we'll reply with the fee and banking details, (3) pay by EFT or card (PayFast), (4) we enrol you and you can start right away.",
      links: [["Enrolment details", "enrolment.html"], ["Email enrolments", "mailto:enrolments@alphacrsolutions.co.za"], ["Open the LMS", "https://learn.alphacrsolutions.co.za"]],
      next: ["pricing", "gcp", "contact"]
    },
    pricing: {
      label: "Pricing",
      answer: "Course fees depend on the delivery format and group size, so we quote on request. Email enrolments@alphacrsolutions.co.za and we'll send the fee and banking details.",
      links: [["Email for a quote", "mailto:enrolments@alphacrsolutions.co.za"]],
      next: ["enrol", "contact"]
    },
    about: {
      label: "About Alpha CR",
      answer: "Alpha CR Solutions is a clinical research consultancy based in Johannesburg, South Africa, supporting sponsors, CROs and sites with regulatory, ethics, monitoring, training and software services.",
      links: [["About us", "about.html"]],
      next: ["gcp", "cra", "contact"]
    },
    contact: {
      label: "Contact a consultant",
      answer: "Happy to connect you with the team. Email info@alphacrsolutions.co.za for general enquiries or enrolments@alphacrsolutions.co.za for training — or use our contact form.",
      links: [["Contact page", "contact.html"], ["Email info", "mailto:info@alphacrsolutions.co.za"]],
      next: []
    }
  };

  // keyword -> topic key
  // Intent words (price, enrol) are checked before topic nouns so that e.g.
  // "how much does GCP training cost" maps to pricing, not GCP.
  var RULES = [
    [/\b(price|pricing|cost|costs|fee|fees|how much|quote|payment)\b/i, "pricing"],
    [/\b(enrol|enroll|register|sign ?up|how do i (join|start|enrol)|get started|book)\b/i, "enrol"],
    [/\b(simulation|simulations|shadow|shadowing|cra training)\b/i, "craTraining"],
    [/(transcelerate|mutual(ly)? recognis|mutual(ly)? recogniz|mutual recognition|\bsip\b|shared investigator)/i, "transcelerate"],
    [/\b(gcp|good clinical practice|e6|ich)\b/i, "gcp"],
    [/\b(cra|monitor|monitoring|sdv|sdr|risk[- ]?based|rbm|site visit)\b/i, "cra"],
    [/\b(sahpra|regulatory|ethic|ethics|nhrec|irb|iec|submission|cta|protocol|icf)\b/i, "regulatory"],
    [/\b(start[- ]?up|mta|permit|permits|vendor|sop|sops|site set)\b/i, "startup"],
    [/\b(software|patient match|matcher|dashboard|data tool)\b/i, "software"],
    [/\b(about|who are|where.*based|location|johannesburg)\b/i, "about"],
    [/\b(contact|consultant|talk|speak|call|phone|reach|get in touch)\b/i, "contact"]
  ];

  var GREETING = "Hi! I'm the Alpha CR assistant. I can help with our services, training and enrolment. What would you like to know?";
  var INITIAL = ["gcp", "cra", "regulatory", "enrol", "contact"];

  // ---- Styles -----------------------------------------------------------
  var css = [
    ".acr-fab{position:fixed;right:20px;bottom:20px;width:58px;height:58px;border-radius:50%;background:#009BA8;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;z-index:99998;transition:transform .15s,background .15s}",
    ".acr-fab:hover{background:#007e89;transform:translateY(-2px)}",
    ".acr-fab svg{width:26px;height:26px;fill:#fff}",
    ".acr-panel{position:fixed;right:20px;bottom:88px;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(13,27,53,.28);display:flex;flex-direction:column;overflow:hidden;z-index:99999;opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;transition:opacity .18s,transform .18s;font-family:Inter,system-ui,Arial,sans-serif}",
    ".acr-panel.open{opacity:1;transform:none;pointer-events:auto}",
    ".acr-head{background:#0D1B35;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}",
    ".acr-head .acr-logo{width:30px;height:30px;border-radius:8px;background:#009BA8;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;font-family:'DM Serif Display',Georgia,serif}",
    ".acr-head h4{margin:0;font-size:14px;font-weight:600;line-height:1.2}",
    ".acr-head p{margin:0;font-size:11px;color:rgba(255,255,255,.6)}",
    ".acr-head .acr-x{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;line-height:1;padding:4px}",
    ".acr-head .acr-x:hover{color:#fff}",
    ".acr-body{flex:1;overflow-y:auto;padding:16px;background:#f5f7fa;display:flex;flex-direction:column;gap:10px}",
    ".acr-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.55}",
    ".acr-bot{align-self:flex-start;background:#fff;color:#20303f;border:1px solid #e6ebf0;border-bottom-left-radius:4px}",
    ".acr-user{align-self:flex-end;background:#009BA8;color:#fff;border-bottom-right-radius:4px}",
    ".acr-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}",
    ".acr-links a{font-size:12px;font-weight:600;color:#007e89;text-decoration:none;border:1px solid #b9e2e6;background:#eafafa;border-radius:20px;padding:4px 10px}",
    ".acr-links a:hover{background:#009BA8;color:#fff;border-color:#009BA8}",
    ".acr-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px;background:#f5f7fa}",
    ".acr-chip{font-size:12px;font-weight:600;color:#0D1B35;background:#fff;border:1px solid #d4dde6;border-radius:20px;padding:6px 12px;cursor:pointer}",
    ".acr-chip:hover{border-color:#009BA8;color:#009BA8}",
    ".acr-input{display:flex;border-top:1px solid #e6ebf0;background:#fff}",
    ".acr-input input{flex:1;border:none;padding:13px 14px;font-size:13px;outline:none;font-family:inherit}",
    ".acr-input button{border:none;background:#009BA8;color:#fff;padding:0 16px;cursor:pointer;font-size:16px}",
    ".acr-input button:hover{background:#007e89}",
    ".acr-foot{font-size:10px;color:#9aa6b2;text-align:center;padding:6px;background:#fff}",
    "@media (max-width:420px){.acr-panel{right:8px;left:8px;width:auto;bottom:84px}}"
  ].join("");

  // ---- Build DOM --------------------------------------------------------
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function init() {
    var style = el("style"); style.textContent = css; document.head.appendChild(style);

    var fab = el("button", "acr-fab");
    fab.setAttribute("aria-label", "Open chat assistant");
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7V9zm6 5H7v-2h6v2zm4-6H7V6h10v2z"/></svg>';

    var panel = el("div", "acr-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Alpha CR Solutions assistant");
    panel.innerHTML =
      '<div class="acr-head"><span class="acr-logo">α</span>' +
      '<div><h4>Alpha CR Assistant</h4><p>Typically replies instantly</p></div>' +
      '<button class="acr-x" aria-label="Close chat">×</button></div>' +
      '<div class="acr-body" id="acr-body"></div>' +
      '<div class="acr-chips" id="acr-chips"></div>' +
      '<form class="acr-input" id="acr-form"><input id="acr-text" type="text" placeholder="Ask a question…" autocomplete="off" aria-label="Type your question"><button type="submit" aria-label="Send">➤</button></form>' +
      '<div class="acr-foot">Automated assistant · for detailed advice, contact a consultant</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    var body = panel.querySelector("#acr-body");
    var chips = panel.querySelector("#acr-chips");
    var form = panel.querySelector("#acr-form");
    var text = panel.querySelector("#acr-text");
    var greeted = false;

    function scroll() { body.scrollTop = body.scrollHeight; }

    function addUser(t) { var m = el("div", "acr-msg acr-user", esc(t)); body.appendChild(m); scroll(); }

    function addBot(topic) {
      var html = esc(topic.answer);
      if (topic.links && topic.links.length) {
        html += '<div class="acr-links">' + topic.links.map(function (l) {
          var ext = /^https?:|^mailto:/.test(l[1]) ? ' target="_blank" rel="noopener"' : "";
          return '<a href="' + esc(l[1]) + '"' + ext + '>' + esc(l[0]) + "</a>";
        }).join("") + "</div>";
      }
      var m = el("div", "acr-msg acr-bot", html); body.appendChild(m); scroll();
      if (topic.next) renderChips(topic.next);
    }

    function addText(t) { var m = el("div", "acr-msg acr-bot", esc(t)); body.appendChild(m); scroll(); }

    function renderChips(keys) {
      chips.innerHTML = "";
      keys.forEach(function (k) {
        if (!KB[k]) return;
        var c = el("button", "acr-chip", esc(KB[k].label));
        c.addEventListener("click", function () { addUser(KB[k].label); setTimeout(function () { addBot(KB[k]); }, 220); });
        chips.appendChild(c);
      });
    }

    function answer(q) {
      for (var i = 0; i < RULES.length; i++) { if (RULES[i][0].test(q)) { addBot(KB[RULES[i][1]]); return; } }
      addText("I'm not sure I caught that — here are some things I can help with. You can also contact a consultant directly.");
      renderChips(["gcp", "cra", "regulatory", "enrol", "contact"]);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = text.value.trim(); if (!q) return;
      addUser(q); text.value = "";
      setTimeout(function () { answer(q); }, 240);
    });

    function open() {
      panel.classList.add("open");
      if (!greeted) { greeted = true; addText(GREETING); renderChips(INITIAL); }
      setTimeout(function () { text.focus(); }, 200);
    }
    function close() { panel.classList.remove("open"); }

    fab.addEventListener("click", function () { panel.classList.contains("open") ? close() : open(); });
    panel.querySelector(".acr-x").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
