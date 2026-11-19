const STORAGE_KEY = "vpnJourneyBasicsV1";

const defaultState = {
  completed: [],
  missions: [],
  connected: false,
  finalText: "",
  studentName: ""
};

let state = loadState();
let selectedMissionAnswers = {};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState, ...(saved || {}) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove("show"), 2400);
}

function feedback(id, message, good) {
  const box = $(id);
  box.textContent = message;
  box.className = `feedback ${good ? "good" : "bad"}`;
}

function complete(activity) {
  if (!state.completed.includes(activity)) {
    state.completed.push(activity);
    saveState();
    updateProgress();
    toast("Activity complete. Progress saved.");
  }
}

function updateProgress() {
  const total = Math.min(20, state.completed.length);
  $("#progressText").textContent = `${total}/20 activities`;
  $("#progressBar").style.width = `${total * 5}%`;
  const missionDone = state.missions.length;
  $("#sideText").textContent = `${missionDone}/12`;
  $("#missionCount").textContent = `${missionDone}/12`;
  $("#sideBar").style.width = `${(missionDone / 12) * 100}%`;
  const ready = total === 20 && state.completed.includes("final-summary");
  $("#certificateSection").classList.toggle("locked", !ready);
}

function renderSelectQuiz(containerId, questions) {
  const container = $(containerId);
  container.innerHTML = questions.map((q, index) => `
    <div class="quiz-row">
      <label for="${containerId.slice(1)}-${index}">${index + 1}. ${q.question}</label>
      <select id="${containerId.slice(1)}-${index}" data-answer="${q.answer}">
        <option value="">Choose an answer</option>
        ${q.options.map((option, optionIndex) => `<option value="${optionIndex}">${option}</option>`).join("")}
      </select>
    </div>`).join("");
}

function checkSelectQuiz(containerId, feedbackId, activityId, successMessage) {
  const selects = $$(`${containerId} select`);
  const unanswered = selects.some(select => select.value === "");
  const correct = selects.filter(select => select.value === select.dataset.answer).length;
  if (unanswered) {
    feedback(feedbackId, "Choose an answer for every question, then try again.", false);
    return;
  }
  if (correct === selects.length) {
    feedback(feedbackId, successMessage, true);
    complete(activityId);
  } else {
    feedback(feedbackId, `${correct} of ${selects.length} are correct. Review the explanation above and try again.`, false);
  }
}

const definitionQuestions = [
  { question: "What does VPN stand for?", options: ["Verified Public Network", "Virtual Private Network", "Virtual Password Number"], answer: 1 },
  { question: "What does a VPN create across a network?", options: ["A protected connection", "A new password", "A public website"], answer: 0 },
  { question: "Why is it often called a tunnel?", options: ["It carries data along a protected path", "It makes the internet underground", "It turns Wi-Fi off"], answer: 0 }
];

const whyQuestions = [
  { question: "A remote employee needs an internal company file. What may provide approved access?", options: ["A company VPN", "A random browser extension", "Airplane mode"], answer: 0 },
  { question: "What helps make tunnel traffic difficult for an observer to read?", options: ["A larger screen", "Encryption", "A shorter username"], answer: 1 },
  { question: "What may a company VPN ask for in addition to a password?", options: ["MFA", "A social-media post", "A game score"], answer: 0 }
];

const protectionQuestions = [
  { question: "Data while it travels through the approved VPN tunnel", options: ["Protected by the VPN tunnel", "Not guaranteed by a VPN"], answer: 0 },
  { question: "Protection from every phishing message", options: ["Protected by the VPN tunnel", "Not guaranteed by a VPN"], answer: 1 },
  { question: "Approved access to private company resources", options: ["A common VPN use", "Not a VPN use"], answer: 0 },
  { question: "Complete anonymity on the internet", options: ["Guaranteed by a VPN", "Not guaranteed by a VPN"], answer: 1 }
];

const mythQuestions = [
  { question: "A VPN replaces the need for strong passwords and MFA.", options: ["Fact", "Myth"], answer: 1 },
  { question: "A VPN can protect traffic while it travels through its tunnel.", options: ["Fact", "Myth"], answer: 0 },
  { question: "Being connected to a VPN makes every download safe.", options: ["Fact", "Myth"], answer: 1 },
  { question: "Users should choose the organisation's approved VPN profile.", options: ["Fact", "Myth"], answer: 0 }
];

const typeQuestions = [
  { question: "One employee connects a laptop to the company from home.", options: ["Remote-access VPN", "Site-to-site VPN"], answer: 0 },
  { question: "Two branch office networks are linked together.", options: ["Remote-access VPN", "Site-to-site VPN"], answer: 1 },
  { question: "Which type will you simulate in this lab?", options: ["Remote-access VPN", "Site-to-site VPN"], answer: 0 }
];

const finalQuestions = [
  { question: "What should be checked before starting a remote-access VPN?", options: ["Internet access and the approved profile", "Only the wallpaper", "Nothing"], answer: 0 },
  { question: "The client says Connected. What is the best next step?", options: ["Assume everything works", "Verify status and test the required approved resource", "Share the password"], answer: 1 },
  { question: "An MFA code has expired. What should you do?", options: ["Request a fresh code and try again", "Disable MFA", "Use another person's code"], answer: 0 },
  { question: "Which statement is correct?", options: ["A VPN stops every threat", "A VPN makes users invisible", "A VPN is one security control and still requires safe behaviour"], answer: 2 }
];

renderSelectQuiz("#definitionQuiz", definitionQuestions);
renderSelectQuiz("#whyQuiz", whyQuestions);
renderSelectQuiz("#protectionSorter", protectionQuestions);
renderSelectQuiz("#mythQuiz", mythQuestions);
renderSelectQuiz("#typeQuiz", typeQuestions);
renderSelectQuiz("#finalQuiz", finalQuestions);

$("#checkDefinition").addEventListener("click", () => checkSelectQuiz("#definitionQuiz", "#definitionFeedback", "definition", "Correct. A VPN is a Virtual Private Network that creates a protected connection."));
$("#checkWhy").addEventListener("click", () => checkSelectQuiz("#whyQuiz", "#whyFeedback", "why", "Correct. VPNs commonly protect data in transit and provide approved remote access."));
$("#checkProtection").addEventListener("click", () => checkSelectQuiz("#protectionSorter", "#protectionFeedback", "protection", "Correct. A VPN protects its tunnel, but it does not remove every cyber risk."));
$("#checkMyths").addEventListener("click", () => checkSelectQuiz("#mythQuiz", "#mythFeedback", "myths", "All myths and facts identified correctly."));
$("#checkTypes").addEventListener("click", () => checkSelectQuiz("#typeQuiz", "#typeFeedback", "types", "Correct. Remote access links a user; site-to-site links networks."));
$("#checkFinalQuiz").addEventListener("click", () => checkSelectQuiz("#finalQuiz", "#finalQuizFeedback", "final-quiz", "Final knowledge check passed."));

const viewTitles = {
  connect: "Connect to VPN",
  status: "Connection status",
  missions: "Guided missions",
  review: "Final review"
};

function showView(name) {
  $$(".nav").forEach(button => button.classList.toggle("active", button.dataset.view === name));
  $$(".view").forEach(view => view.classList.toggle("active", view.id === `view-${name}`));
  $("#viewTitle").textContent = viewTitles[name];
}

$$(".nav").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));

function setCheck(name, met) {
  const row = $(`[data-check="${name}"]`);
  const label = row.textContent.replace(/^[○✓]\s*/, "");
  row.textContent = `${met ? "✓" : "○"} ${label}`;
  row.classList.toggle("met", met);
}

function updateConnectionUI() {
  const connected = state.connected;
  const badge = $("#connectionBadge");
  badge.textContent = connected ? "CONNECTED" : "DISCONNECTED";
  badge.classList.toggle("connected", connected);
  $("#statusConnected").textContent = connected ? "Connected" : "Disconnected";
  $("#statusIp").textContent = connected ? "10.50.20.44" : "—";
  $("#statusGateway").textContent = connected ? "vpn.training.local" : "—";
  $("#statusTraffic").textContent = connected ? "Company resources" : "—";
  if (connected) {
    ["internet", "profile", "credentials", "mfa", "tunnel"].forEach(name => setCheck(name, true));
    $("#connectLog").textContent = "[OK] Internet available\n[OK] Approved profile loaded\n[OK] Credentials and MFA accepted\n[OK] Encrypted VPN tunnel established";
  } else {
    ["internet", "profile", "credentials", "mfa", "tunnel"].forEach(name => setCheck(name, false));
  }
}

$("#connectVpn").addEventListener("click", () => {
  const internet = $("#internetStatus").value === "online";
  const profile = $("#vpnProfile").value;
  const credentials = $("#vpnUser").value.trim() === "student.analyst" && $("#vpnPassword").value === "Training!123";
  const mfa = $("#vpnMfa").value.trim() === "246810";
  setCheck("internet", internet);
  setCheck("profile", profile === "company");
  setCheck("credentials", credentials);
  setCheck("mfa", mfa);
  setCheck("tunnel", false);
  const errors = [];
  if (!internet) errors.push("Connect to the internet first.");
  if (!profile) errors.push("Choose a VPN profile.");
  if (profile === "unknown") errors.push("The Unknown Free VPN is not an approved company profile.");
  if (!credentials) errors.push("Use the fictional username and password shown in the field hints.");
  if (!mfa) errors.push("Use the fictional six-digit MFA code shown in the field hint.");
  if (errors.length) {
    state.connected = false;
    saveState();
    $("#connectLog").textContent = errors.map(error => `[CHECK] ${error}`).join("\n");
    updateConnectionUI();
    return;
  }
  state.connected = true;
  saveState();
  updateConnectionUI();
  toast("VPN tunnel established. Open Status and test Company Files.");
});

$("#disconnectVpn").addEventListener("click", () => {
  state.connected = false;
  saveState();
  updateConnectionUI();
  $("#connectLog").textContent = "[INFO] VPN disconnected safely.\n[INFO] Company resources are no longer available through the tunnel.";
  toast("VPN disconnected.");
});

$$("[data-resource]").forEach(button => button.addEventListener("click", () => {
  const resource = button.dataset.resource;
  const result = $("#resourceResult");
  if (resource === "public") {
    result.textContent = "Public website opened. Public access alone does not prove that the VPN works.";
    return;
  }
  if (!state.connected) {
    result.textContent = "Access denied. Connect to the Company VPN before opening this private resource.";
    return;
  }
  result.textContent = resource === "files"
    ? "Success: Company Files opened through the VPN tunnel. Connection verified."
    : "Success: HR portal opened through the VPN tunnel.";
  if (resource === "files") {
    feedback("#verifyFeedback", "Connection verified: status is Connected and a private resource works.", true);
    complete("verify");
  }
}));

const missions = [
  {
    title: "Choose the right time to connect",
    subtitle: "Remote work decision",
    scenario: "Asha is at home and must open a private company file. What should she do before opening it?",
    choices: ["Use the approved company VPN", "Post the file publicly", "Use any free VPN advertisement"],
    answer: 0,
    hint: "The company file is private and Asha is outside the office.",
    explanation: "Correct. An approved remote-access VPN can provide a protected path to authorised company resources."
  },
  {
    title: "Select an approved profile",
    subtitle: "Trust the configured service",
    scenario: "The client lists Company VPN and Unknown Free VPN. Which profile should Ravi choose for work?",
    choices: ["Unknown Free VPN", "Company VPN", "Whichever has the brighter logo"],
    answer: 1,
    hint: "Use services that the organisation has reviewed and approved.",
    explanation: "Correct. The approved company profile has known ownership, settings and support."
  },
  {
    title: "Put the first checks in order",
    subtitle: "Prepare before authentication",
    scenario: "The VPN cannot start because the laptop is offline. What is the first sensible action?",
    choices: ["Connect to the internet", "Disable the password", "Keep entering MFA codes"],
    answer: 0,
    hint: "A VPN tunnel normally travels across another network.",
    explanation: "Correct. Internet connectivity is normally required before a remote VPN tunnel can be established."
  },
  {
    title: "Complete authentication",
    subtitle: "Password plus MFA",
    scenario: "The password is accepted and the client now requests an MFA code. What should the user do?",
    choices: ["Enter their current approved MFA code", "Ask a colleague for a code", "Turn off MFA"],
    answer: 0,
    hint: "MFA helps prove that the login belongs to the authorised user.",
    explanation: "Correct. The user should complete their own approved MFA challenge and never share codes."
  },
  {
    title: "Verify the connection",
    subtitle: "Do not trust one message alone",
    scenario: "The VPN says Connected. Which check gives useful confirmation?",
    choices: ["Test an approved private resource and inspect status", "Change the desktop colour", "Assume every service works"],
    answer: 0,
    hint: "Verification checks both the client state and the required result.",
    explanation: "Correct. A status check plus an approved resource test provides better evidence that the connection works."
  },
  {
    title: "Use public Wi-Fi safely",
    subtitle: "Approved remote access",
    scenario: "Mina is on airport Wi-Fi and must access a work portal. What is the best choice?",
    choices: ["Connect using the approved VPN before the portal", "Share her password with airport staff", "Ignore company policy"],
    answer: 0,
    hint: "Use the organisation's approved method when working away from a trusted location.",
    explanation: "Correct. She should follow policy and establish the approved VPN before accessing private work resources."
  },
  {
    title: "Recognise a VPN limitation",
    subtitle: "Security still needs people",
    scenario: "A connected user receives a convincing phishing email. Does the VPN prove that the email is safe?",
    choices: ["Yes, every message is safe on VPN", "No, the message still needs careful review", "Yes, if the logo looks real"],
    answer: 1,
    hint: "A protected network path does not judge every message or link.",
    explanation: "Correct. A VPN does not remove phishing risk; the user must still inspect messages and follow reporting procedures."
  },
  {
    title: "Disconnect when finished",
    subtitle: "Close the remote session",
    scenario: "The work task is finished and policy says the VPN should be disconnected. What should the user do?",
    choices: ["Use the client's Disconnect control", "Delete the VPN profile", "Turn off MFA forever"],
    answer: 0,
    hint: "Use the normal client control so the tunnel closes cleanly.",
    explanation: "Correct. The Disconnect control closes the current tunnel without deleting approved settings."
  },
  {
    title: "Handle a rejected password",
    subtitle: "Simple troubleshooting",
    scenario: "The client reports an incorrect password. What should the user check first?",
    choices: ["Carefully re-enter their own password and check Caps Lock", "Borrow a colleague's account", "Install an unknown VPN"],
    answer: 0,
    hint: "Start with a safe, reversible check that does not bypass security.",
    explanation: "Correct. Check typing and Caps Lock, retry carefully, then use the approved password-reset or support process if needed."
  },
  {
    title: "Handle an expired MFA code",
    subtitle: "Use a fresh challenge",
    scenario: "The one-time MFA code expired before it was entered. What is the safe next step?",
    choices: ["Request or wait for a fresh code", "Reuse it many times", "Ask someone else for theirs"],
    answer: 0,
    hint: "One-time codes are deliberately short-lived.",
    explanation: "Correct. Use a new valid code from the approved MFA method; never use another person's code."
  },
  {
    title: "Connected but files do not open",
    subtitle: "Collect useful information",
    scenario: "The client says Connected, but Company Files will not open. What is the best basic response?",
    choices: ["Check status, reconnect once, then contact support with the error", "Disable security controls", "Guess until it works"],
    answer: 0,
    hint: "Use simple checks and preserve the exact error for support.",
    explanation: "Correct. Verify the state, try one controlled reconnect, and report the time and error if the problem remains."
  },
  {
    title: "Final judgement: know the boundary",
    subtitle: "The hardest mission",
    scenario: "Leo is connected to the company VPN. A website asks him to download an unexpected tool and enter his work password. Which statement is best?",
    choices: ["VPN means the request is automatically trusted", "VPN protects the path, but Leo should stop and verify the request through approved channels", "VPN makes the password safe to share anywhere"],
    answer: 1,
    hint: "Separate tunnel protection from trust in a website, file or person.",
    explanation: "Correct. The VPN protects traffic through its configured tunnel; it does not prove that an unexpected request is legitimate."
  }
];

function renderMissions() {
  $("#missionList").innerHTML = missions.map((mission, index) => {
    const done = state.missions.includes(index);
    return `<article class="mission ${done ? "complete" : ""}" data-mission="${index}">
      <button class="mission-title" type="button">
        <span>MISSION ${String(index + 1).padStart(2, "0")}</span>
        <div><h4>${mission.title}</h4><small>${mission.subtitle}</small></div>
        <span class="mstatus">${done ? "COMPLETE" : "READY"}</span>
      </button>
      <div class="mission-body">
        <p class="scenario">${mission.scenario}</p>
        <div class="choices">${mission.choices.map((choice, choiceIndex) => `<button class="choice" type="button" data-choice="${choiceIndex}">${choice}</button>`).join("")}</div>
        <button class="hintbtn" type="button">Show hint</button>
        <p class="hint">${mission.hint}</p>
        <button class="btn primary check-mission" type="button">Check answer</button>
        <p class="mfeedback ${done ? "good" : ""}">${done ? mission.explanation : ""}</p>
      </div>
    </article>`;
  }).join("");

  $$(".mission-title").forEach(button => button.addEventListener("click", () => {
    button.closest(".mission").classList.toggle("open");
  }));
  $$(".choice").forEach(button => button.addEventListener("click", () => {
    const article = button.closest(".mission");
    const index = Number(article.dataset.mission);
    selectedMissionAnswers[index] = Number(button.dataset.choice);
    $$(".choice", article).forEach(choice => choice.classList.toggle("selected", choice === button));
  }));
  $$(".hintbtn").forEach(button => button.addEventListener("click", () => button.nextElementSibling.classList.toggle("show")));
  $$(".check-mission").forEach(button => button.addEventListener("click", () => {
    const article = button.closest(".mission");
    const index = Number(article.dataset.mission);
    const message = $(".mfeedback", article);
    if (selectedMissionAnswers[index] === undefined) {
      message.className = "mfeedback bad";
      message.textContent = "Choose one answer first. Use the hint if you need it.";
      return;
    }
    if (selectedMissionAnswers[index] !== missions[index].answer) {
      message.className = "mfeedback bad";
      message.textContent = "Not quite. Read the scenario and hint, then try again.";
      return;
    }
    if (!state.missions.includes(index)) state.missions.push(index);
    if (!state.completed.includes(`mission-${index + 1}`)) state.completed.push(`mission-${index + 1}`);
    saveState();
    renderMissions();
    updateProgress();
    const current = $(`[data-mission="${index}"]`);
    current.classList.add("open");
    toast(`Mission ${index + 1} complete.`);
  }));
}

renderMissions();

const rubricTerms = {
  before: ["internet", "approved", "profile", "network"],
  auth: ["password", "mfa", "authentication", "code"],
  verify: ["verify", "status", "connected", "resource", "ip"],
  limit: ["phishing", "malware", "anonymous", "limitation", "does not", "not protect", "not stop"]
};

function evaluateSummary() {
  const text = $("#finalText").value.trim().toLowerCase();
  const results = {};
  Object.entries(rubricTerms).forEach(([name, terms]) => {
    results[name] = terms.some(term => text.includes(term));
    const row = $(`[data-r="${name}"]`);
    const label = row.textContent.replace(/^[○✓]\s*/, "");
    row.textContent = `${results[name] ? "✓" : "○"} ${label}`;
    row.classList.toggle("met", results[name]);
  });
  return { text, results, passed: text.length >= 80 && Object.values(results).every(Boolean) };
}

$("#finalText").value = state.finalText || "";
$("#finalText").addEventListener("input", () => {
  state.finalText = $("#finalText").value;
  saveState();
  evaluateSummary();
});

$("#submitFinal").addEventListener("click", () => {
  const evaluation = evaluateSummary();
  if (!evaluation.passed) {
    feedback("#finalFeedback", "Add at least 80 characters and cover every item: preparation, password/MFA, verification and one limitation.", false);
    return;
  }
  feedback("#finalFeedback", "Excellent. Your explanation covers the complete safe connection routine.", true);
  complete("final-summary");
  setTimeout(() => $("#certificateSection").scrollIntoView({ behavior: "smooth" }), 350);
});

function drawCertificate(name) {
  const canvas = $("#certificate");
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#edf6ff");
  gradient.addColorStop(1, "#eaf9f3");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#286bd6";
  ctx.lineWidth = 18;
  ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);
  ctx.strokeStyle = "#23aebe";
  ctx.lineWidth = 3;
  ctx.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);
  ctx.textAlign = "center";
  ctx.fillStyle = "#286bd6";
  ctx.font = "bold 34px Segoe UI, Arial";
  ctx.fillText("VPN JOURNEY ACADEMY", canvas.width / 2, 150);
  ctx.fillStyle = "#243447";
  ctx.font = "bold 76px Georgia, serif";
  ctx.fillText("Certificate of Completion", canvas.width / 2, 290);
  ctx.font = "30px Segoe UI, Arial";
  ctx.fillStyle = "#65788b";
  ctx.fillText("This certificate is awarded to", canvas.width / 2, 385);
  ctx.fillStyle = "#243447";
  ctx.font = "bold 65px Georgia, serif";
  ctx.fillText(name, canvas.width / 2, 485);
  ctx.strokeStyle = "#90a8bb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(310, 515);
  ctx.lineTo(1090, 515);
  ctx.stroke();
  ctx.font = "30px Segoe UI, Arial";
  ctx.fillStyle = "#3d5267";
  ctx.fillText("for successfully completing the beginner VPN Basics Lab", canvas.width / 2, 600);
  ctx.font = "24px Segoe UI, Arial";
  ctx.fillText("20 activities · connection simulation · 12 guided missions · final review", canvas.width / 2, 660);
  ctx.fillStyle = "#27a56c";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 770, 64, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px Segoe UI, Arial";
  ctx.fillText("VPN", canvas.width / 2, 780);
  ctx.fillStyle = "#65788b";
  ctx.font = "22px Segoe UI, Arial";
  ctx.fillText(`Completed ${new Date().toLocaleDateString()}`, canvas.width / 2, 900);
  return canvas;
}

$("#studentName").value = state.studentName || "";
$("#studentName").addEventListener("input", () => {
  state.studentName = $("#studentName").value;
  saveState();
});

$("#downloadCertificate").addEventListener("click", () => {
  if (state.completed.length < 20) {
    toast("Complete all activities first.");
    return;
  }
  const name = $("#studentName").value.trim();
  if (name.length < 2) {
    toast("Enter your full name first.");
    $("#studentName").focus();
    return;
  }
  const canvas = drawCertificate(name);
  const link = document.createElement("a");
  link.download = `VPN-Basics-Certificate-${name.replace(/[^a-z0-9]+/gi, "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

$("#resume").addEventListener("click", () => {
  const target = state.completed.length >= 6 ? "#simulator" : state.completed.length >= 3 ? "#lesson3" : "#lesson1";
  $(target).scrollIntoView({ behavior: "smooth" });
});

$("#reset").addEventListener("click", () => {
  if (!confirm("Reset all VPN lab progress? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

evaluateSummary();
updateConnectionUI();
updateProgress();
