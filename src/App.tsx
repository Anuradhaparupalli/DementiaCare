/// <reference types="vite/client" />
import { useState, type ReactNode, type ChangeEvent } from "react";
import {
  Brain,
  LockKeyhole,
  Settings,
  UserRound,
  Heart,
  ShieldCheck,
  Volume2,
  Globe,
  ArrowLeft,
  Puzzle,
  Mic,
  Target,
  LogOut,
} from "lucide-react";
import "./index.css";

// Separate game components
import FolderFamilyRecognition from "./games/FamilyRecognition/FamilyRecognition";
import FocusActivityGame from "./games/FocusActivity/FocusActivity";
import JigsawGame from "./games/Jigsaw/Jigsaw";
import MemoryMatchGame from "./games/MemoryMatch/MemoryMatch";
import NumberPuzzleGame from "./games/NumberPuzzle/NumberPuzzle";
import OddOneOutGame from "./games/OddOneOut/OddOneOut";
import PictureMatchingGame from "./games/PictureMatching/PictureMatching";
import VoiceMusicGame from "./games/VoiceMusic/VoiceMusic";
import WordSearchGame from "./games/WordSearch/WordSearch";
type Page =
  | "login"
  | "register"
  | "home"
  | "settings"
  | "patient"
  | "activity";
type Activity = {
  title: string;
  description: string;
  image: string;
  icon: ReactNode;
  color: string;
};
type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  image: string;
};
type DailyTask = {
  id: string;
  title: string;
  completed: boolean;
};

type PatientDetails = {
  name: string;
  age: string;
  condition: string;
  phone: string;
  emergencyContact: string;
  notes: string;
};

type CaretakerInfo = {
  name: string;
  relation: string;
  phone: string;
  email: string;
};

type GameResult = {
  id: string;
  game: string;
  score: number;
  correct: number;
  wrong: number;
  attempts: number;
  roundsPlayed: number;
  accuracy: number;
  startedAt: string;
  completedAt: string;
};

type CaretakerSection =
  | "dashboard"
  | "profile"
  | "family"
  | "tasks"
  | "performance";

const defaultPatientDetails: PatientDetails = {
  name: "MindCare Patient",
  age: "",
  condition: "",
  phone: "",
  emergencyContact: "",
  notes: "",
};

const defaultCaretakerInfo: CaretakerInfo = {
  name: "Caretaker",
  relation: "Family Caregiver",
  phone: "",
  email: "",
};

function loadLocalStorage<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}



function CaretakerPortal({ onBack }: { onBack: () => void }) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [caretakerSection, setCaretakerSection] =
    useState<CaretakerSection>("dashboard");

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() =>
    loadLocalStorage<FamilyMember[]>("mindcareFamilyMembers", [])
  );

  const [patientDetails, setPatientDetails] = useState<PatientDetails>(() =>
    loadLocalStorage<PatientDetails>(
      "mindcarePatientDetails",
      defaultPatientDetails
    )
  );

  const [caretakerInfo, setCaretakerInfo] = useState<CaretakerInfo>(() =>
    loadLocalStorage<CaretakerInfo>("mindcareCaretakerInfo", defaultCaretakerInfo)
  );

  const [tasks, setTasks] = useState<DailyTask[]>(() =>
    loadLocalStorage<DailyTask[]>("mindcareDailyTasks", [])
  );

  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [familyImage, setFamilyImage] = useState("");
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const unlockPortal = () => {
    if (pin === "1234") {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  const savePatientDetails = () => {
    localStorage.setItem("mindcarePatientDetails", JSON.stringify(patientDetails));
    localStorage.setItem("mindcareCaretakerInfo", JSON.stringify(caretakerInfo));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 1800);
  };

  const updatePatientField = (
    field: keyof PatientDetails,
    value: string
  ) => {
    setPatientDetails((previous) => ({ ...previous, [field]: value }));
  };

  const updateCaretakerField = (
    field: keyof CaretakerInfo,
    value: string
  ) => {
    setCaretakerInfo((previous) => ({ ...previous, [field]: value }));
  };

  const handleFamilyImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFamilyImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addFamilyMember = () => {
    if (!familyName.trim() || !familyRelation.trim() || !familyImage) {
      alert("Please add a photo, name and relationship.");
      return;
    }
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: familyName.trim(),
      relation: familyRelation.trim(),
      image: familyImage,
    };
    const updatedMembers = [...familyMembers, newMember];
    setFamilyMembers(updatedMembers);
    localStorage.setItem("mindcareFamilyMembers", JSON.stringify(updatedMembers));
    setFamilyName("");
    setFamilyRelation("");
    setFamilyImage("");
  };

  const removeFamilyMember = (id: string) => {
    const updatedMembers = familyMembers.filter((member) => member.id !== id);
    setFamilyMembers(updatedMembers);
    localStorage.setItem("mindcareFamilyMembers", JSON.stringify(updatedMembers));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const updatedTasks = [
      ...tasks,
      { id: Date.now().toString(), title: newTask.trim(), completed: false },
    ];
    setTasks(updatedTasks);
    localStorage.setItem("mindcareDailyTasks", JSON.stringify(updatedTasks));
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("mindcareDailyTasks", JSON.stringify(updatedTasks));
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem("mindcareDailyTasks", JSON.stringify(updatedTasks));
  };

  const startEditingTask = (task: DailyTask) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const saveEditedTask = () => {
    if (!editingTaskId || !editingTaskTitle.trim()) return;
    const updatedTasks = tasks.map((task) =>
      task.id === editingTaskId
        ? { ...task, title: editingTaskTitle.trim() }
        : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("mindcareDailyTasks", JSON.stringify(updatedTasks));
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const gameResults = loadLocalStorage<GameResult[]>("mindcareGameResults", []);

  // Family Recognition also creates one completed GameResult session.
  // Its raw answer history is kept separately for detailed records,
  // so it must not be counted twice in the overall score.
  const totalCorrect = gameResults.reduce(
    (sum, result) => sum + result.correct,
    0
  );
  const totalAttempts = gameResults.reduce(
    (sum, result) => sum + result.attempts,
    0
  );
  const overallScore = totalAttempts
    ? Math.round((totalCorrect / totalAttempts) * 100)
    : 0;
  const activitiesPlayed = gameResults.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressLabel =
    overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : overallScore > 0 ? "Needs Support" : "No Results Yet";

  if (!unlocked) {
    return (
      <div className="page-container">
        <header className="top-header">
          <button className="back-button" type="button" onClick={onBack}>
            <ArrowLeft size={22} />
            Back
          </button>
          <div className="brand">
            <div className="brand-icon"><Heart size={28} /></div>
            <span>MindCare</span>
          </div>
          <div />
        </header>
        <main className="login-page" style={{ minHeight: "calc(100vh - 82px)" }}>
          <div className="login-card">
            <div className="logo-box"><LockKeyhole size={48} /></div>
            <h1>Caretaker Portal</h1>
            <p className="login-subtitle">Secure access to patient care and progress.</p>
            <div className="input-group">
              <label>4-Digit Caretaker PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                placeholder="Enter 4-digit PIN"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(value);
                  setError("");
                }}
                onKeyDown={(e) => { if (e.key === "Enter") unlockPortal(); }}
              />
            </div>
            {error && <p className="input-error">{error}</p>}
            <button className="primary-button" type="button" onClick={unlockPortal}>
              <LockKeyhole size={19} /> Unlock Caretaker Portal
            </button>
            <p style={{ textAlign: "center", marginTop: 14, color: "#64748b" }}>
              Your PIN keeps patient information private.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const navItems: Array<{ key: CaretakerSection; label: string; icon: ReactNode }> = [
    { key: "dashboard", label: "Dashboard", icon: <Brain size={21} /> },
    { key: "profile", label: "Patient & Caretaker", icon: <UserRound size={21} /> },
    { key: "family", label: "Family Members", icon: <Heart size={21} /> },
    { key: "tasks", label: "Daily Tasks", icon: <Target size={21} /> },
    { key: "performance", label: "Performance", icon: <Puzzle size={21} /> },
  ];

  return (
    <div className="page-container">
      <header className="top-header">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={22} /> Back
        </button>
        <div className="brand">
          <div className="brand-icon"><Heart size={28} /></div>
          <span>MindCare Caretaker</span>
        </div>
        <button className="icon-button" type="button" onClick={() => { setPin(""); setUnlocked(false); }} title="Lock portal">
          <LockKeyhole size={22} />
        </button>
      </header>

      <main className="caretaker-content">
        <aside className="caretaker-sidebar">
          <div className="caretaker-sidebar-title">Care Management</div>
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={caretakerSection === item.key ? "caretaker-nav active" : "caretaker-nav"}
              onClick={() => setCaretakerSection(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <div className="caretaker-main">
          {caretakerSection === "dashboard" && (
            <>
              <div className="caretaker-page-heading">
                <div>
                  <p className="hello-text">Caretaker Dashboard</p>
                  <h1>Hello, {caretakerInfo.name || "Caretaker"} 👋</h1>
                  <p className="settings-subtitle">Here is the latest care and activity summary.</p>
                </div>
                <button className="secondary-button" type="button" onClick={() => setCaretakerSection("profile")}>
                  <UserRound size={19} /> Edit Details
                </button>
              </div>

              <div className="caretaker-info-banner">
                <div className="caretaker-avatar"><UserRound size={32} /></div>
                <div>
                  <strong>{caretakerInfo.name || "Caretaker"}</strong>
                  <span>{caretakerInfo.relation || "Caregiver"}</span>
                  <small>{caretakerInfo.phone || "Phone not added"} {caretakerInfo.email ? `• ${caretakerInfo.email}` : ""}</small>
                </div>
              </div>

              <div className="caretaker-stats">
                <div className="caretaker-stat-card"><Brain size={30} /><strong>{overallScore}%</strong><span>Overall Game Score</span></div>
                <div className="caretaker-stat-card"><Target size={30} /><strong>{completedTasks}/{tasks.length}</strong><span>Tasks Completed</span></div>
                <div className="caretaker-stat-card"><Puzzle size={30} /><strong>{activitiesPlayed}</strong><span>Games Solved</span></div>
              </div>

              <div className="profile-summary-grid">
                <div className="settings-card">
                  <h2>Patient Information</h2>
                  <p><strong>Name:</strong> {patientDetails.name || "Not added"}</p>
                  <p><strong>Age:</strong> {patientDetails.age || "Not added"}</p>
                  <p><strong>Condition:</strong> {patientDetails.condition || "Not added"}</p>
                  <button className="secondary-button" type="button" onClick={() => setCaretakerSection("profile")}>
                    Edit Patient Details
                  </button>
                </div>
                <div className="settings-card">
                  <h2>Care Summary</h2>
                  <p><strong>Family members:</strong> {familyMembers.length}</p>
                  <p><strong>Games recorded:</strong> {activitiesPlayed}</p>
                  <p><strong>Current progress:</strong> {progressLabel}</p>
                  <p><strong>Daily tasks:</strong> {tasks.length}</p>
                </div>
              </div>
            </>
          )}

          {caretakerSection === "profile" && (
            <>
              <div className="caretaker-page-heading">
                <div>
                  <p className="hello-text">Profiles</p>
                  <h1>Patient & Caretaker Information</h1>
                  <p className="settings-subtitle">Update the information whenever the care situation changes.</p>
                </div>
                {profileSaved && <span className="success-message">Saved successfully ✓</span>}
              </div>

              <div className="profile-edit-grid">
                <div className="settings-card">
                  <h2>Patient Details</h2>
                  <div className="input-group"><label>Patient Name</label><input value={patientDetails.name} onChange={(e) => updatePatientField("name", e.target.value)} placeholder="Enter patient name" /></div>
                  <div className="input-group"><label>Age</label><input type="number" value={patientDetails.age} onChange={(e) => updatePatientField("age", e.target.value)} placeholder="Enter age" /></div>
                  <div className="input-group"><label>Condition / Care Needs</label><input value={patientDetails.condition} onChange={(e) => updatePatientField("condition", e.target.value)} placeholder="Example: Memory support" /></div>
                  <div className="input-group"><label>Patient Phone</label><input type="tel" value={patientDetails.phone} onChange={(e) => updatePatientField("phone", e.target.value)} placeholder="Enter phone number" /></div>
                  <div className="input-group"><label>Emergency Contact</label><input value={patientDetails.emergencyContact} onChange={(e) => updatePatientField("emergencyContact", e.target.value)} placeholder="Name and phone" /></div>
                  <div className="input-group"><label>Care Notes</label><textarea value={patientDetails.notes} onChange={(e) => updatePatientField("notes", e.target.value)} placeholder="Add important care notes" rows={4} /></div>
                </div>

                <div className="settings-card">
                  <h2>Caretaker Information</h2>
                  <div className="input-group"><label>Caretaker Name</label><input value={caretakerInfo.name} onChange={(e) => updateCaretakerField("name", e.target.value)} placeholder="Enter caretaker name" /></div>
                  <div className="input-group"><label>Relationship</label><input value={caretakerInfo.relation} onChange={(e) => updateCaretakerField("relation", e.target.value)} placeholder="Example: Daughter" /></div>
                  <div className="input-group"><label>Phone</label><input type="tel" value={caretakerInfo.phone} onChange={(e) => updateCaretakerField("phone", e.target.value)} placeholder="Enter phone number" /></div>
                  <div className="input-group"><label>Email</label><input type="email" value={caretakerInfo.email} onChange={(e) => updateCaretakerField("email", e.target.value)} placeholder="Enter email" /></div>
                  <button className="primary-button" type="button" onClick={savePatientDetails}>
                    <ShieldCheck size={19} /> Save All Details
                  </button>
                </div>
              </div>
            </>
          )}

          {caretakerSection === "family" && (
            <>
              <h1>Family Members</h1>
              <p className="settings-subtitle">These faces are used by the Family Recognition game.</p>
              <div className="settings-card">
                <div className="input-group"><label>Family Member Name</label><input type="text" value={familyName} placeholder="Enter name" onChange={(e) => setFamilyName(e.target.value)} /></div>
                <div className="input-group"><label>Relationship</label><input type="text" value={familyRelation} placeholder="Example: Daughter" onChange={(e) => setFamilyRelation(e.target.value)} /></div>
                <div className="input-group"><label>Photo</label><input type="file" accept="image/*" onChange={handleFamilyImage} /></div>
                {familyImage && <img src={familyImage} alt="Preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 16, marginBottom: 15 }} />}
                <button className="primary-button" type="button" onClick={addFamilyMember}>Add Family Member</button>
              </div>
              <div className="family-list">
                {familyMembers.length === 0 ? (
                  <div className="settings-card"><p>No family members added yet.</p></div>
                ) : familyMembers.map((member) => (
                  <div className="family-member-card" key={member.id}>
                    <img src={member.image} alt={member.name} />
                    <div><h3>{member.name}</h3><p>{member.relation}</p></div>
                    <button className="secondary-button" type="button" onClick={() => removeFamilyMember(member.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {caretakerSection === "tasks" && (
            <>
              <h1>Daily Tasks</h1>
              <p className="settings-subtitle">Create tasks for the patient. Nothing is added automatically.</p>
              <div className="settings-card">
                <div className="task-create-row">
                  <input value={newTask} placeholder="Example: Complete a memory game" onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTask(); }} />
                  <button className="primary-button" type="button" onClick={addTask}>Add Task</button>
                </div>
              </div>
              <div className="settings-card">
                {tasks.length === 0 ? (
                  <div className="empty-state"><Target size={34} /><h3>No daily tasks yet</h3><p>Create the first task above.</p></div>
                ) : tasks.map((task) => (
                  <div className="task-management-row" key={task.id}>
                    {editingTaskId === task.id ? (
                      <>
                        <input value={editingTaskTitle} onChange={(e) => setEditingTaskTitle(e.target.value)} />
                        <button className="secondary-button" type="button" onClick={saveEditedTask}>Save</button>
                        <button className="icon-button" type="button" onClick={() => setEditingTaskId(null)} title="Cancel">×</button>
                      </>
                    ) : (
                      <>
                        <label className="task-check-label">
                          <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                          <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</span>
                        </label>
                        <div className="task-actions">
                          <button className="secondary-button" type="button" onClick={() => startEditingTask(task)}>Edit</button>
                          <button className="secondary-button danger-button" type="button" onClick={() => deleteTask(task.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {caretakerSection === "performance" && (
            <>
              <div className="caretaker-page-heading">
                <div>
                  <p className="hello-text">Patient Progress</p>
                  <h1>Performance Analysis</h1>
                  <p className="settings-subtitle">Calculated from the patient's completed game results.</p>
                </div>
              </div>
              <div className="caretaker-stats">
                <div className="caretaker-stat-card"><Target size={30} /><strong>{overallScore}%</strong><span>Overall Score</span></div>
                <div className="caretaker-stat-card"><Brain size={30} /><strong>{activitiesPlayed}</strong><span>Games / Rounds Recorded</span></div>
                <div className="caretaker-stat-card"><Heart size={30} /><strong>{progressLabel}</strong><span>Progress Level</span></div>
              </div>
              <div className="settings-card">
                <h2>Game Performance</h2>
                {gameResults.length === 0 ? (
                  <div className="empty-state"><Puzzle size={34} /><h3>No game results yet</h3><p>The score will appear here after the patient completes an activity.</p></div>
                ) : (
                  <div className="performance-list">
                    {gameResults.slice().reverse().slice(0, 12).map((result, index) => (
                      <div className="performance-row" key={`${result.id}-${index}`}>
                        <div>
                          <strong>{result.game}</strong>
                          <span>
                            {new Date(result.completedAt).toLocaleString()} • {result.roundsPlayed} round(s) • {result.correct}/{result.attempts} correct
                          </span>
                        </div>
                        <strong>{result.accuracy}%</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<Page>("login");
  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);
  const [showCaretaker, setShowCaretaker] = useState(false);
  const handleLogin = () => {
    setPage("home");
  };
  const openActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setPage("activity");
  };
  // CARETAKER PORTAL
  if (showCaretaker) {
    return (
      <div className="app">
        <CaretakerPortal
          onBack={() => setShowCaretaker(false)}
        />
      </div>
    );
  }
  return (
    <div className="app">
      {page === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onRegister={() => setPage("register")}
        />
      )}
      {page === "register" && (
        <RegisterPage
          onBack={() => setPage("login")}
          onRegistered={() => setPage("login")}
        />
      )}
      {page === "home" && (
        <HomePage
          onSettings={() => setPage("settings")}
          onPatient={() => setPage("patient")}
          onCaretaker={() => setShowCaretaker(true)}
        />
      )}
      {page === "patient" && (
        <PatientPortal
          onBack={() => setPage("home")}
          onActivity={openActivity}
        />
      )}
      {page === "activity" && selectedActivity && (
        <ActivityPage
          activity={selectedActivity}
          onBack={() => setPage("patient")}
        />
      )}
      {page === "settings" && (
        <SettingsPage
          onBack={() => setPage("home")}
          onLogout={() => setPage("login")}
        />
      )}
    </div>
  );
}
/* LOGIN */
function LoginPage({
  onLogin,
  onRegister,
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
  const login = () => {
    setEmailError("");
    setPasswordError("");
    setLoginError("");
    if (!email.trim()) {
      setEmailError("Please enter your email.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setPasswordError(
        "Password must be at least 6 characters."
      );
      return;
    }
    const storedUser = localStorage.getItem("mindcareUser");
    if (!storedUser) {
      setLoginError(
        "No account found. Please create an account first."
      );
      return;
    }
    let user: { email: string; password: string };
    try {
      user = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("mindcareUser");
      setLoginError("Saved account data is invalid. Please create your account again.");
      return;
    }
    if (
      user.email.toLowerCase() !==
      email.trim().toLowerCase()
    ) {
      setEmailError("No account found with this email.");
      return;
    }
    if (user.password !== password) {
      setPasswordError("Incorrect password.");
      return;
    }
    onLogin();
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-box">
          <Brain size={48} />
        </div>
        <h1>Welcome to MindCare</h1>
        <p className="login-subtitle">
          A gentle space for memory, connection & care
        </p>
        {/* EMAIL */}
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              setLoginError("");
            }}
          />
          {emailError && (
            <p className="input-error">
              {emailError}
            </p>
          )}
        </div>
        {/* PASSWORD */}
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
              setLoginError("");
            }}
          />
          {passwordError && (
            <p className="input-error">
              {passwordError}
            </p>
          )}
        </div>
        {loginError && (
          <p className="login-error">
            {loginError}
          </p>
        )}
        <button
          type="button"
          className="primary-button"
          onClick={() => login()}
        >
          Login
        </button>
        <p className="small-link">
          Forgot password?
        </p>
        <p className="create-account">
          New to MindCare?{" "}
          <button
  type="button"
  className="link-button"
  onClick={() => {
    console.log("Create Account clicked");
    onRegister();
  }}
>
  Create Account
</button>
        </p>
      </div>
    </div>
  );
}
/* REGISTER */
function RegisterPage({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] =
    useState("");
  const [confirmError, setConfirmError] =
    useState("");
  const [success, setSuccess] = useState("");
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
  const register = () => {
    setEmailError("");
    setPasswordError("");
    setConfirmError("");
    setSuccess("");
    if (!email.trim()) {
      setEmailError("Please enter your email.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setPasswordError("Please create a password.");
      return;
    }
    if (password.length < 6) {
      setPasswordError(
        "Password must be at least 6 characters."
      );
      return;
    }
    if (!confirmPassword) {
      setConfirmError(
        "Please confirm your password."
      );
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(
        "Passwords do not match."
      );
      return;
    }
    const existingUser =
      localStorage.getItem("mindcareUser");
    if (existingUser) {
      let user: { email: string; password: string };
      try {
        user = JSON.parse(existingUser);
      } catch {
        localStorage.removeItem("mindcareUser");
        user = { email: "", password: "" };
      }
      if (
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
      ) {
        setEmailError(
          "An account with this email already exists."
        );
        return;
      }
    }
    const newUser = {
      email: email.trim(),
      password: password,
    };
    localStorage.setItem(
      "mindcareUser",
      JSON.stringify(newUser)
    );
    setSuccess(
      "Account created successfully!"
    );
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      onRegistered();
    }, 1200);
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-box">
          <Brain size={48} />
        </div>
        <h1>Create Account</h1>
        <p className="login-subtitle">
          Create your MindCare account
        </p>
        {/* EMAIL */}
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
          />
          {emailError && (
            <p className="input-error">
              {emailError}
            </p>
          )}
        </div>
        {/* PASSWORD */}
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
          />
          {passwordError && (
            <p className="input-error">
              {passwordError}
            </p>
          )}
        </div>
        {/* CONFIRM PASSWORD */}
        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmError("");
            }}
          />
          {confirmError && (
            <p className="input-error">
              {confirmError}
            </p>
          )}
        </div>
        {success && (
          <p className="success-message">
            {success}
          </p>
        )}
        <button
          type="button"
          className="primary-button"
          onClick={() => register()}
        >
          Create Account
        </button>
        <p className="create-account">
          Already have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => onBack()}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
/* HOME */
function HomePage({
  onSettings,
  onPatient,
  onCaretaker,
}: {
  onSettings: () => void;
  onPatient: () => void;
  onCaretaker: () => void;
}) {
  return (
    <div className="page-container">
      <header className="top-header">
        <div className="brand">
          <div className="brand-icon">
            <Brain size={28} />
          </div>
          <span>MindCare</span>
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={onSettings}
            title="Settings"
          >
            <Settings size={23} />
          </button>
          <div className="user-icon">
            <UserRound size={23} />
          </div>
        </div>
      </header>
      <main className="home-content">
        <div className="welcome-section">
          <div className="welcome-badge">
            <Heart size={17} />
            Welcome back
          </div>
          <h2>How would you like to continue?</h2>
          <p>
            Choose a portal to get started.
          </p>
        </div>
        <div className="portal-grid">
          <button
            className="portal-card patient-card"
            onClick={onPatient}
          >
            <div className="portal-image">
              <Brain size={55} />
            </div>
            <div className="portal-info">
              <h3>Patient Portal</h3>
              <p>
                Games, puzzles and daily activities
              </p>
            </div>
            <span className="card-arrow">→</span>
          </button>
          <button
            className="portal-card caretaker-card"
            onClick={onCaretaker}
          >
            <div className="portal-image">
              <LockKeyhole size={53} />
            </div>
            <div className="portal-info">
              <h3>Caretaker Portal</h3>
              <p>
                Manage care and monitor progress
              </p>
            </div>
            <span className="card-arrow">→</span>
          </button>
        </div>
        <div className="home-note">
          <ShieldCheck size={20} />
          Your care journey, made simple and comfortable.
        </div>
      </main>
    </div>
  );
}
/* PATIENT PORTAL */
function PatientPortal({
  onBack,
  onActivity,
}: {
  onBack: () => void;
  onActivity: (activity: Activity) => void;
}) {
  return (
    <div className="page-container">
      <header className="top-header">
        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={22} />
          Back
        </button>
        <div className="brand">
          <div className="brand-icon">
            <Brain size={28} />
          </div>
          <span>MindCare</span>
        </div>
        <div className="user-icon">
          <UserRound size={23} />
        </div>
      </header>
      <main className="patient-content">
        <div className="patient-heading">
          <div>
            <p className="hello-text">
              Patient Portal
            </p>
            <h2>
              Choose an activity 🌿
            </h2>
            <p>
              Take your time. There is no rush.
            </p>
          </div>
          <div className="patient-heart">
            <Heart size={42} />
          </div>
        </div>
        <div className="activity-grid">
          {/* PUZZLES */}
          <button
            className="activity-card blue"
            onClick={() =>
              onActivity({
                title: "Puzzles",
                description: "Fun thinking activities",
                image: "/icons/puz.png",
                icon: <Puzzle size={46} />,
                color: "blue",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/puz.png"
                alt="Puzzles"
              />
            </div>
            <div className="activity-text">
              <h3>Puzzles</h3>
              <p>Fun thinking activities</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* MEMORY */}
          <button
            className="activity-card green"
            onClick={() =>
              onActivity({
                title: "Memory Game",
                description: "Exercise your memory",
                image: "/icons/hero.png",
                icon: <Brain size={46} />,
                color: "green",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/hero.png"
                alt="Memory Game"
              />
            </div>
            <div className="activity-text">
              <h3>Memory Game</h3>
              <p>Exercise your memory</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* NUMBER PUZZLE */}
          <button
            className="activity-card yellow"
            onClick={() =>
              onActivity({
                title: "Number Puzzle",
                description: "Practice number skills",
                image: "/icons/num.png",
                icon: <span className="text-icon">123</span>,
                color: "yellow",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/num.png"
                alt="Number Puzzle"
              />
            </div>
            <div className="activity-text">
              <h3>Number Puzzle</h3>
              <p>Practice number skills</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* WORD PUZZLE */}
          <button
            className="activity-card pink"
            onClick={() =>
              onActivity({
                title: "Word Puzzle",
                description: "Find and remember words",
                image: "/icons/word.png",
                icon: <span className="text-icon">ABC</span>,
                color: "pink",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/word.png"
                alt="Word Puzzle"
              />
            </div>
            <div className="activity-text">
              <h3>Word Puzzle</h3>
              <p>Find and remember words</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* ODD ONE OUT */}
          <button
            className="activity-card purple"
            onClick={() =>
              onActivity({
                title: "Odd One Out",
                description: "Find the different one",
                image: "/icons/ooo.png",
                icon: <Target size={46} />,
                color: "purple",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/ooo.png"
                alt="Odd One Out"
              />
            </div>
            <div className="activity-text">
              <h3>Odd One Out</h3>
              <p>Find the different one</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* FAMILY RECOGNITION */}
          <button
            className="activity-card pink"
            onClick={() =>
              onActivity({
                title: "Family Recognition",
                description: "Recognize familiar family members",
                image: "/icons/hero.png",
                icon: <Heart size={46} />,
                color: "pink",
              })
            }
          >
            <div className="activity-image">
              <div className="text-icon">❤️</div>
            </div>
            <div className="activity-text">
              <h3>Family Recognition</h3>
              <p>Recognize familiar faces</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* MATCHING */}
          <button
            className="activity-card mint"
            onClick={() =>
              onActivity({
                title: "Matching",
                description: "Match similar objects",
                image: "/icons/imagem.png",
                icon: <Puzzle size={46} />,
                color: "mint",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/imagem.png"
                alt="Matching"
              />
            </div>
            <div className="activity-text">
              <h3>Matching</h3>
              <p>Match similar objects</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* FOCUS */}
          <button
            className="activity-card peach"
            onClick={() =>
              onActivity({
                title: "Focus Activity",
                description: "Improve your attention",
                image: "/icons/imagen.png",
                icon: <Target size={46} />,
                color: "peach",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/imagen.png"
                alt="Focus Activity"
              />
            </div>
            <div className="activity-text">
              <h3>Focus Activity</h3>
              <p>Improve your attention</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
          {/* VOICE & MUSIC */}
          <button
            className="activity-card lavender"
            onClick={() =>
              onActivity({
                title: "Voice & Music",
                description: "Listen and recognize",
                image: "/icons/imagef.png",
                icon: <Mic size={46} />,
                color: "lavender",
              })
            }
          >
            <div className="activity-image">
              <img
                src="/icons/imagef.png"
                alt="Voice and Music"
              />
            </div>
            <div className="activity-text">
              <h3>Voice & Music</h3>
              <p>Listen and recognize</p>
            </div>
            <span className="activity-arrow">→</span>
          </button>
        </div>
      </main>
    </div>
  );
}
/* ACTIVITY ROUTER */
function GameBackButton({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ padding: "18px 24px 0" }}>
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={22} />
        Activities
      </button>
    </div>
  );
}

function ActivityPage({
  activity,
  onBack,
}: {
  activity: Activity;
  onBack: () => void;
}) {
  // These are the actual game files from src/games/.
  // The title from Patient Portal decides which folder component is opened.
  if (activity.title === "Puzzles") {
    return (
      <div className="page-container">
        <GameBackButton onBack={onBack} />
        <JigsawGame />
      </div>
    );
  }

  if (activity.title === "Memory Game") {
    return (
      <div className="page-container">
        <GameBackButton onBack={onBack} />
        <MemoryMatchGame />
      </div>
    );
  }

  if (activity.title === "Number Puzzle") {
    return <NumberPuzzleGame onBack={onBack} />;
  }

  if (activity.title === "Word Puzzle") {
    return (
      <div className="page-container">
        <GameBackButton onBack={onBack} />
        <WordSearchGame />
      </div>
    );
  }

  if (activity.title === "Odd One Out") {
    return (
      <div className="page-container">
        <GameBackButton onBack={onBack} />
        <OddOneOutGame />
      </div>
    );
  }

  if (activity.title === "Family Recognition") {
    return (
      <div className="page-container">
        <GameBackButton onBack={onBack} />
        <FolderFamilyRecognition />
      </div>
    );
  }

  if (activity.title === "Matching") {
    return <PictureMatchingGame onBack={onBack} />;
  }

  if (activity.title === "Focus Activity") {
    return <FocusActivityGame onBack={onBack} />;
  }

  if (activity.title === "Voice & Music") {
    return <VoiceMusicGame onBack={onBack} />;
  }

  return (
    <div className="page-container">
      <header className="top-header">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={22} />
          Activities
        </button>
        <div className="brand">
          <div className="brand-icon">
            <Brain size={28} />
          </div>
          <span>MindCare</span>
        </div>
        <div className="user-icon">
          <UserRound size={23} />
        </div>
      </header>
      <main className="activity-page">
        <div className={`activity-hero ${activity.color}`}>
          <img
            src={activity.image}
            alt={activity.title}
            className="large-activity-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <h2>{activity.title}</h2>
          <p>{activity.description}</p>
        </div>
        <div className="coming-card">
          <div className="coming-icon">
            {activity.icon}
          </div>
          <h3>Ready to Begin?</h3>
          <p>
            This activity will be interactive.
            Your score, attempts and completion time
            will be recorded automatically.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={() => alert("We will build this game next! 🧩")}
          >
            Start Activity
          </button>
        </div>
      </main>
    </div>
  );
}

/* SETTINGS */
function SettingsPage({
  onBack,
  onLogout,
}: {
  onBack: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="page-container">
      <header className="top-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={22} />
          Back
        </button>
        <div className="brand">
          <div className="brand-icon">
            <Settings size={27} />
          </div>
          <span>Settings</span>
        </div>
        <div />
      </header>
      <main className="settings-content">
        <h2>Settings</h2>
        <p className="settings-subtitle">
          Make MindCare comfortable for you.
        </p>
        <div className="settings-card">
          <SettingRow
            icon={<Globe />}
            title="Language"
            value="English"
          />
          <SettingRow
            icon={<Volume2 />}
            title="Sound"
            value="On"
          />
          <SettingRow
            icon={<UserRound />}
            title="Text Size"
            value="Large"
          />
          <SettingRow
            icon={<ShieldCheck />}
            title="Notifications"
            value="On"
          />
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </main>
    </div>
  );
}
function SettingRow({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="setting-row">
      <div className="setting-left">
        <div className="setting-icon">
          {icon}
        </div>
        <span>{title}</span>
      </div>
      <span className="setting-value">
        {value}
      </span>
    </div>
  );
}
export default App;
