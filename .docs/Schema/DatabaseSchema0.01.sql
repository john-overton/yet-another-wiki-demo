-- Users table
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    auth_type TEXT CHECK(auth_type IN ('Email', 'Microsoft', 'Google')) NOT NULL,
    role TEXT CHECK(role IN ('Admin', 'PowerUser', 'User')) NOT NULL,
    is_active INTEGER DEFAULT 1,
    current_active_company_id INTEGER,
    notification_preferences TEXT,
    voting_rights INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Companies table
CREATE TABLE Companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT,
    domain TEXT,
    auth_type TEXT CHECK(auth_type IN ('Email', 'Microsoft', 'Google')) NOT NULL,
    billing_info TEXT,
    subscription_level TEXT CHECK(subscription_level IN ('BaseTier', 'BusinessTier', 'EnterpriseTier')) NOT NULL,
    no_bid_template TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Departments table
CREATE TABLE Departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_company_id INTEGER,
    parent_sub_company_id INTEGER,
    cost_center TEXT,
    no_bid_template TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_company_id) REFERENCES Companies(id),
    FOREIGN KEY (parent_sub_company_id) REFERENCES SubCompanies(id)
);

-- SubCompanies table
CREATE TABLE SubCompanies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_company_id INTEGER NOT NULL,
    billing_info TEXT,
    no_bid_template TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_company_id) REFERENCES Companies(id)
);

-- RFPs table
CREATE TABLE RFPs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    organization_id INTEGER NOT NULL,
    organization_type TEXT CHECK(organization_type IN ('Company', 'Department', 'SubCompany')) NOT NULL,
    summary TEXT,
    status TEXT CHECK(status IN ('Processing', 'Active', 'Archived', 'Closed')) NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    due_date TEXT,
    estimated_value REAL,
    fit_score INTEGER CHECK (fit_score BETWEEN 1 AND 4),
    ai_processing_status TEXT CHECK(ai_processing_status IN ('Queued', 'Processing', 'Completed', 'Failed')) NOT NULL,
    ai_conversation_cache TEXT
);

-- Files table
CREATE TABLE Files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    content BLOB,
    uploaded_by INTEGER NOT NULL,
    uploaded_at TEXT DEFAULT (datetime('now')),
    rfp_id INTEGER NOT NULL,
    FOREIGN KEY (uploaded_by) REFERENCES Users(id),
    FOREIGN KEY (rfp_id) REFERENCES RFPs(id)
);

-- Questions table
CREATE TABLE Questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    is_answered INTEGER DEFAULT 0,
    answer TEXT,
    rfp_id INTEGER NOT NULL,
    answered_by INTEGER,
    answered_at TEXT,
    category TEXT CHECK(category IN ('Known', 'Unknown')) NOT NULL,
    FOREIGN KEY (rfp_id) REFERENCES RFPs(id),
    FOREIGN KEY (answered_by) REFERENCES Users(id)
);

-- Comments table
CREATE TABLE Comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    rfp_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    related_section TEXT CHECK(related_section IN ('Files', 'Summary', 'Voting', 'Questions', 'Review')) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (rfp_id) REFERENCES RFPs(id)
);

-- Tasks table
CREATE TABLE Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    assigned_to INTEGER NOT NULL,
    due_date TEXT,
    status TEXT CHECK(status IN ('Pending', 'InProgress', 'Completed')) NOT NULL,
    rfp_id INTEGER NOT NULL,
    FOREIGN KEY (assigned_to) REFERENCES Users(id),
    FOREIGN KEY (rfp_id) REFERENCES RFPs(id)
);

-- Milestones table
CREATE TABLE Milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    rfp_id INTEGER NOT NULL,
    FOREIGN KEY (rfp_id) REFERENCES RFPs(id)
);

-- Votes table
CREATE TABLE Votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    rfp_id INTEGER NOT NULL,
    decision TEXT CHECK(decision IN ('Go', 'NoGo')) NOT NULL,
    comments TEXT,
    voted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (rfp_id) REFERENCES RFPs(id)
);

-- Notifications table
CREATE TABLE Notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('Mention', 'Update', 'NewRFP')) NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    related_object_type TEXT,
    related_object_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- APIUsage table
CREATE TABLE APIUsage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    rfp_count INTEGER DEFAULT 0,
    question_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES Companies(id)
);

-- Feedback table
CREATE TABLE Feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    allow_sharing INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- User-Company association table
CREATE TABLE UserCompanies (
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, company_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (company_id) REFERENCES Companies(id)
);

-- User-Department association table
CREATE TABLE UserDepartments (
    user_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, department_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (department_id) REFERENCES Departments(id)
);

-- RFP Followers table
CREATE TABLE RFPFollowers (
    rfp_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (rfp_id, user_id),
    FOREIGN KEY (rfp_id) REFERENCES RFPs(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);