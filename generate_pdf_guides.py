import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable, PageBreak
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages after page 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Samadhan Setu — Technical Presentation & Architecture Manual")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "CONFIDENTIAL — Technical Team Comprehensive Guide & Evaluator Manual")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()


def get_custom_styles(primary_hex, secondary_hex):
    styles = getSampleStyleSheet()
    primary_color = colors.HexColor(primary_hex)
    secondary_color = colors.HexColor(secondary_hex)
    body_color = colors.HexColor("#334155")

    return {
        'title': ParagraphStyle(
            'DocTitle', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=22, leading=26,
            textColor=primary_color, spaceAfter=4
        ),
        'subtitle': ParagraphStyle(
            'DocSubTitle', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=11, leading=15,
            textColor=secondary_color, spaceAfter=12
        ),
        'h1': ParagraphStyle(
            'SectionH1', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=13, leading=17,
            textColor=primary_color, spaceBefore=12, spaceAfter=6,
            keepWithNext=True
        ),
        'h2': ParagraphStyle(
            'SectionH2', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=10.5, leading=14,
            textColor=secondary_color, spaceBefore=8, spaceAfter=4,
            keepWithNext=True
        ),
        'body': ParagraphStyle(
            'BodyCustom', parent=styles['Normal'],
            fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=body_color, spaceAfter=5
        ),
        'bullet': ParagraphStyle(
            'BulletCustom', parent=styles['Normal'],
            fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=body_color, leftIndent=10, firstLineIndent=-6, spaceAfter=3
        ),
        'q_title': ParagraphStyle(
            'QTitle', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=9.5, leading=13,
            textColor=colors.HexColor("#1E1B4B"), spaceBefore=6, spaceAfter=2,
            keepWithNext=True
        ),
        'a_body': ParagraphStyle(
            'ABody', parent=styles['Normal'],
            fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=body_color, spaceAfter=6
        ),
        'table_header': ParagraphStyle(
            'TH', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=8.5, leading=11,
            textColor=colors.HexColor("#0F172A")
        ),
        'table_body': ParagraphStyle(
            'TB', parent=styles['Normal'],
            fontName='Helvetica', fontSize=8, leading=11,
            textColor=body_color
        )
    }


def build_full_frontend_pdf(filename="Frontend_Tech_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename, pagesize=letter,
        leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54
    )
    s = get_custom_styles("#1E3A8A", "#2563EB")
    story = []

    # Title Banner
    story.append(Paragraph("Samadhan Setu — Full Frontend Technical Manual", s['title']))
    story.append(Paragraph("Complete Architecture, Component Workflows, Mapping Engine & 10 Presentation Q&As", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceBefore=0, spaceAfter=10))

    # 1. Executive Summary & Architecture
    story.append(Paragraph("1. Executive Summary & System Architecture", s['h1']))
    story.append(Paragraph(
        "Samadhan Setu is a crowdsourcing & collaboration platform connecting citizens reporting localized "
        "grassroots challenges with academic institutions, industry CSR cells, and government administrators. "
        "The frontend is engineered as a modern Single Page Application (SPA) prioritizing visual responsiveness, "
        "interactive GIS mapping, real-time client-side validation, and role-based interface adaptation.",
        s['body']
    ))

    stack_rows = [
        [Paragraph("<b>Component Layer</b>", s['table_header']), Paragraph("<b>Technology & Package</b>", s['table_header']), Paragraph("<b>Technical Function & Value Proposition</b>", s['table_header'])],
        [Paragraph("Core SPA Framework", s['table_body']), Paragraph("React 18.3 + Vite 5.2", s['table_body']), Paragraph("Fast HMR bundling, declarative component rendering & strict state isolation.", s['table_body'])],
        [Paragraph("Client Routing", s['table_body']), Paragraph("React Router DOM 6.23", s['table_body']), Paragraph("Client-side routing with dynamic parameter matching (`/challenges/:id`) & ProtectedRoute wrappers.", s['table_body'])],
        [Paragraph("UI Styling & Icons", s['table_body']), Paragraph("Tailwind CSS 3.4 + Lucide React", s['table_body']), Paragraph("Utility-first styling system, responsive grid layouts, and vector icon primitives.", s['table_body'])],
        [Paragraph("Geospatial GIS Engine", s['table_body']), Paragraph("Leaflet 1.9 + React-Leaflet 4.2", s['table_body']), Paragraph("OpenStreetMap interactive coordinate picker, GPS geolocation & color-coded severity pins.", s['table_body'])],
        [Paragraph("HTTP Client & Auth", s['table_body']), Paragraph("Axios 1.7 + Interceptors", s['table_body']), Paragraph("Centralized API client with automated JWT bearer token injection via HTTP headers.", s['table_body'])],
        [Paragraph("Global Session State", s['table_body']), Paragraph("React Context API (`AuthContext`)", s['table_body']), Paragraph("Persists authentication session, token lifecycle, and role evaluation (`citizen`, `institution`, `admin`).", s['table_body'])]
    ]
    t_stack = Table(stack_rows, colWidths=[110, 130, 264])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EFF6FF")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5), ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_stack)
    story.append(Spacer(1, 8))

    # 2. Directory Structure & File Responsibility
    story.append(Paragraph("2. Frontend Directory Structure & File Map", s['h1']))
    file_map = [
        ("`src/main.jsx`", "Application root entry point. Mounts `App.jsx` into the DOM `div#root` inside standard React `StrictMode`."),
        ("`src/App.jsx`", "Root routing configuration containing top-level Navbar, footer layout, and route switch definitions (`/`, `/login`, `/register`, `/create-challenge`, `/challenges/:id`, `/my-challenges`, `/admin`, `/institution`)."),
        ("`src/context/AuthContext.jsx`", "Provides `AuthContext` provider. Stores user profile and JWT token in `localStorage`, performs `/api/auth/me` validation on app launch, and exposes `login`, `register`, and `logout` methods."),
        ("`src/services/api.js`", "Axios instance pre-configured with `baseURL: '/api'`. Attaches `Authorization: Bearer <token>` header to all outgoing requests if token exists in `localStorage`."),
        ("`src/components/ProtectedRoute.jsx`", "Route guard wrapper preventing unauthorized access. Redirects unauthenticated users to `/login` and role-mismatched users to `/`."),
        ("`src/components/LocationPickerMap.jsx`", "Interactive GIS map picker. Handles click events to capture exact `lat`/`lng` coordinates, marker dragging (`dragend`), HTML5 Geolocation (`navigator.geolocation`), and map recentering."),
        ("`src/components/ChallengeMapDisplay.jsx`", "Dual-mode Leaflet display component. Renders single challenge marker with Google Maps directions link OR multi-marker public feed map with severity-coded SVG icons."),
        ("`src/components/StatusTimeline.jsx`", "Renders the 5-stage lifecycle stepper (`Pending` → `Open` → `Under Review` → `In Progress` → `Resolved`) with status notes and historical audit timestamps."),
        ("`src/components/ChallengeCard.jsx`", "Card UI item for public feeds showing title, category, location, severity badge, affected count, vote count, and status badge.")
    ]
    for fn, fd in file_map:
        story.append(Paragraph(f"• <b>{fn}</b>: {fd}", s['bullet']))

    story.append(Spacer(1, 8))

    # 3. Comprehensive View / Page Breakdown
    story.append(Paragraph("3. Detailed View & Page Breakdown", s['h1']))
    pages_detail = [
        ("Public Feed (`Home.jsx`)", "Serves as the main discovery hub. Features a full-text search input (filtering title, location, description), status category filters, and a **Grid / Map View toggle switch**. Uses `ChallengeCard.jsx` for grid view and `ChallengeMapDisplay.jsx` for multi-pin interactive GIS map view."),
        ("Challenge Intake (`CreateChallenge.jsx`)", "Citizen report creation form. Requires exact state, district, locality, landmark, pincode, severity level, affected count, and who is affected. Features a 400ms debounced auto-search against `/api/challenges/similar` to surface existing duplicate reports, encouraging citizens to upvote existing issues. Embeds `LocationPickerMap.jsx` and transmits multi-part binary media uploads via `FormData`."),
        ("Challenge Detail (`ChallengeDetail.jsx`)", "Comprehensive single-issue page. Displays ground evidence photo gallery, `ChallengeMapDisplay.jsx`, 5-stage `StatusTimeline.jsx`, Admin control actions (Approve, Mark Resolved), Institutional proposal submission form, assigned proposal details, execution progress evidence timeline, and community comment thread."),
        ("Admin Portal (`AdminDashboard.jsx`)", "Moderation workspace. Lists pending challenges awaiting verification, displays duplicate score metrics, enables report merging, and manages user privileges."),
        ("Institution Portal (`InstitutionDashboard.jsx`)", "Partner workspace for academic and CSR bodies to filter open challenges by domain, track proposal evaluation statuses, and upload progress evidence.")
    ]
    for pn, pd in pages_detail:
        story.append(Paragraph(f"<b>{pn}</b>", s['h2']))
        story.append(Paragraph(pd, s['body']))

    story.append(Spacer(1, 8))

    # 4. Presentation Outline & Script for Presenters
    story.append(Paragraph("4. Step-by-Step Presentation Script for Presenters", s['h1']))
    script_steps = [
        "<b>Step 1: Introduction (Slide 1)</b> — 'Good morning/afternoon evaluators. I am representing the Frontend Development team for Samadhan Setu. Our frontend is a responsive, accessible React 18 SPA built with Vite and Tailwind CSS designed to empower citizens to report grassroots issues with exact geospatial precision.'",
        "<b>Step 2: GIS Map Integration Demo (Slide 2)</b> — 'A major innovation in our platform is moving beyond text-only locations. We built `LocationPickerMap` using Leaflet and OpenStreetMap. Citizens can click on the map or tap \"Use My Current Location\" via HTML5 Geolocation to capture exact latitude and longitude coordinates without relying on expensive proprietary APIs.'",
        "<b>Step 3: Duplicate Mitigation & UX (Slide 3)</b> — 'To prevent platform clutter, as a user types a challenge title, our frontend debounces input by 400ms and queries the backend duplicate engine. If similar issues exist nearby, an amber card alerts the user to upvote the existing report instead of creating a duplicate.'",
        "<b>Step 4: Lifecycle Stepper & Role Adaptation (Slide 4)</b> — 'Our detail page dynamically adapts based on user role (`AuthContext`). Citizens see upvoting and community discussions; accredited institutions see proposal submission forms; admins see status controls and report merging tools, all linked to a 5-stage visual `StatusTimeline` stepper.'"
    ]
    for ss in script_steps:
        story.append(Paragraph(ss, s['body']))

    story.append(Spacer(1, 10))

    # 5. Top 10 Technical Q&A for Evaluators
    story.append(Paragraph("5. Top 10 Technical Presentation Q&As (Frontend)", s['h1']))

    qa10_frontend = [
        ("Q1: How is authentication managed and persisted across page refreshes?",
         "<b>Answer:</b> Auth state is managed via `AuthContext.jsx`. Upon login or registration, the backend returns a JSON Web Token (JWT) and user profile object. The token is stored in `localStorage`. On application mount, an `useEffect` in `AuthContext` checks `localStorage` and queries `/api/auth/me` to revalidate and restore state. Axios interceptors automatically attach `Authorization: Bearer <token>` to all HTTP requests."),

        ("Q2: How does the interactive map integration work without paid Google Maps API keys?",
         "<b>Answer:</b> We integrated Leaflet JS (`leaflet` & `react-leaflet`) with free OpenStreetMap tile servers (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`). `LocationPickerMap` captures map click events to set precise `latitude` and `longitude` coordinates, while also offering an HTML5 Geolocation (`navigator.geolocation`) button. We created custom dynamic SVG marker pins color-coded by severity (Red for Critical, Orange for High, Amber for Medium) rendered via Leaflet's `L.divIcon`."),

        ("Q3: How is real-time duplicate challenge prevention handled on the frontend?",
         "<b>Answer:</b> As the citizen types a title in `CreateChallenge.jsx`, a `useEffect` trigger with a 400ms debounce timer sends a query to `/api/challenges/similar?title=...&category=...`. If similar existing issues are found in that district/locality, an alert card instantly displays matching reports with direct links, prompting the user to upvote existing issues rather than creating duplicates."),

        ("Q4: How are file uploads (ground photos) transmitted from React to the backend?",
         "<b>Answer:</b> Since image files cannot be sent as standard JSON, we use browser native `FormData`. In `CreateChallenge.jsx` and `ChallengeDetail.jsx`, image files selected via `<input type='file'>` are appended to a `FormData` instance along with text fields, and sent via Axios with `'Content-Type': 'multipart/form-data'`. This enables binary file streaming to Express `multer` middleware."),

        ("Q5: How is Role-Based Access Control (RBAC) enforced on the UI?",
         "<b>Answer:</b> RBAC is enforced both visually and structurally. `ProtectedRoute.jsx` wraps private routes, redirecting unauthenticated users to `/login` or unauthorized roles to `/`. Within pages like `ChallengeDetail.jsx`, conditional rendering inspects `user.role`: citizens see the Upvote button; institutions see the Proposal Submission form; admins see approval and status transition buttons."),

        ("Q6: Why did you choose Vite over Create React App (CRA)?",
         "<b>Answer:</b> Vite utilizes native ES modules (ESM) and esbuild pre-bundling during development, providing instant server start times and sub-millisecond Hot Module Replacement (HMR) regardless of application size. In production, Vite uses Rollup for highly optimized chunking and tree-shaking, resulting in smaller bundle sizes (e.g. 466 kB JavaScript bundle built in ~2 seconds)."),

        ("Q7: How do you handle map recentering when coordinates change externally (e.g. via Geolocation)?",
         "<b>Answer:</b> In `LocationPickerMap.jsx`, we created a helper child component `RecenterMap` that consumes the `useMap()` hook provided by `react-leaflet`. When `position` state updates via browser geolocation, `RecenterMap` executes `map.setView([position.lat, position.lng], 15)` to smoothly animate and re-center the Leaflet map view on the user's GPS coordinates."),

        ("Q8: How is state synchronization maintained between Grid View and Map View on the Home page?",
         "<b>Answer:</b> `Home.jsx` maintains a single master state array `challenges` fetched from `/api/challenges` based on active search queries and filters. The `viewMode` toggle state (`grid` | `map`) simply determines whether `filteredChallenges` array is passed to `ChallengeCard` grid items or the `ChallengeMapDisplay` multi-marker Leaflet component. Filtering one automatically updates both views synchronously."),

        ("Q9: How are Leaflet default marker URL missing issues resolved in modern JavaScript bundlers?",
         "<b>Answer:</b> Modern bundlers like Vite/Webpack rewrite asset paths, breaking Leaflet's default marker image relative URLs. We solved this by explicitly resetting `L.Icon.Default.prototype._getIconUrl` and overriding default options with static CDN URLs (`unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png`), ensuring markers render reliably in all build environments."),

        ("Q10: What measures are taken to optimize accessibility and user experience across devices?",
         "<b>Answer:</b> Tailwind CSS standardizes responsive mobile-first layouts using breakpoint utilities (`sm:`, `md:`, `lg:`). Form inputs include clear label associations, ARIA attributes, semantic HTML tags (`<form>`, `<input>`, `<button>`), contrast-compliant color scales (Slate-900, Brand-600), and fallback loading spinners during asynchronous network requests.")
    ]

    for q, a in qa10_frontend:
        story.append(Paragraph(q, s['q_title']))
        story.append(Paragraph(a, s['a_body']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated {filename}")


def build_full_backend_pdf(filename="Backend_Tech_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename, pagesize=letter,
        leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54
    )
    s = get_custom_styles("#065F46", "#0D9488")
    story = []

    # Title Banner
    story.append(Paragraph("Samadhan Setu — Full Backend Technical Manual", s['title']))
    story.append(Paragraph("API Architecture, Database Schemas, Duplicate Detection Algorithm & 10 Presentation Q&As", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#065F46"), spaceBefore=0, spaceAfter=10))

    # 1. Architecture & Infrastructure
    story.append(Paragraph("1. Backend Infrastructure & System Architecture", s['h1']))
    story.append(Paragraph(
        "The backend is constructed as a RESTful API service using Node.js and Express.js, utilizing Mongoose ODM "
        "for object mapping against MongoDB. It features strict schema validation, role-based JWT authorization, "
        "multi-file media processing via Multer, and incorporates an embedded in-memory MongoDB fallback engine "
        "(`mongodb-memory-server`) allowing zero-dependency automated startup and testing.",
        s['body']
    ))

    stack_rows = [
        [Paragraph("<b>Component Layer</b>", s['table_header']), Paragraph("<b>Technology & Package</b>", s['table_header']), Paragraph("<b>Implementation Details & Responsibility</b>", s['table_header'])],
        [Paragraph("Server Framework", s['table_body']), Paragraph("Node.js + Express 4.19", s['table_body']), Paragraph("Modular REST API router, JSON middleware, static asset serving & error handlers.", s['table_body'])],
        [Paragraph("Database / ODM", s['table_body']), Paragraph("MongoDB + Mongoose 8.5", s['table_body']), Paragraph("Document schema definitions, validation, compound indexes & query population.", s['table_body'])],
        [Paragraph("DB Fallback Engine", s['table_body']), Paragraph("MongoMemoryServer 10", s['table_body']), Paragraph("Spawns embedded in-memory MongoDB daemon if local Mongo instance is offline.", s['table_body'])],
        [Paragraph("Auth & Password Security", s['table_body']), Paragraph("JWT + bcryptjs 2.4", s['table_body']), Paragraph("Blowfish password salt hashing (factor 10) & 30-day JWT bearer tokens.", s['table_body'])],
        [Paragraph("Media Processing", s['table_body']), Paragraph("Multer 1.4", s['table_body']), Paragraph("Multipart form-data processing, image MIME filtering & disk storage under `/uploads`.", s['table_body'])]
    ]
    t_stack = Table(stack_rows, colWidths=[110, 130, 264])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#ECFDF5")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#A7F3D0")),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5), ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_stack)
    story.append(Spacer(1, 8))

    # 2. Directory Structure & File Map
    story.append(Paragraph("2. Backend Directory Structure & File Map", s['h1']))
    file_map = [
        ("`server.js`", "Main application entry point. Initializes Express middleware, routes, static file serving (`/uploads`), database connection with seed fallback, and error handling middleware."),
        ("`config/db.js`", "Database manager. Attempts connecting to standard MongoDB URI; if connection fails, spawns `MongoMemoryServer` dynamically to ensure zero-downtime execution."),
        ("`models/Challenge.js`", "Primary Mongoose model storing challenge title, description, location fields (state, district, locality, landmark, pincode), GIS coordinates (`latitude`, `longitude`), `regionType`, `affectedWho`, `baselineMetric`, category, severity, status, `statusHistory`, and `mergedInto` references."),
        ("`models/User.js`", "User authentication model storing name, email (unique index), hashed password, role (`citizen`, `institution`, `admin`), organization, partnerType, and interests."),
        ("`models/Proposal.js`", "Institutional resolution proposal model linking challenge ID and institution user ID with proposed technical solution, cost, timeline, and status."),
        ("`models/ProgressUpdate.js`", "Execution evidence model tracking progress updates posted by institutions during solution execution."),
        ("`models/Vote.js`", "Voting model with compound unique index `{ challenge: 1, user: 1 }` preventing duplicate upvotes at the database layer."),
        ("`models/GroundCheck.js`", "Post-resolution citizen verification model tracking verdicts (`Working`, `Improved`, `Unchanged`, `Worsened`)."),
        ("`controllers/challengeController.js`", "Core business logic controller handling challenge creation, full-text searching, real-time duplicate scoring, report merging, voting, status updates, and ground-checks."),
        ("`middleware/authMiddleware.js`", "Security middleware providing `protect` token verification, `adminOnly` access enforcement, and `institutionOnly` authorization checks.")
    ]
    for fn, fd in file_map:
        story.append(Paragraph(f"• <b>{fn}</b>: {fd}", s['bullet']))

    story.append(Spacer(1, 8))

    # 3. Core Algorithms & Logic
    story.append(Paragraph("3. Core Backend Algorithms & Logic", s['h1']))
    algos = [
        "1. <b>Duplicate Search & Scoring Engine (`findSimilarChallenges`)</b>: Tokenizes input title using regular expressions, strips common stop words ('the', 'in', 'near'), normalizes term variants ('streetlights' -> 'street light'), computes keyword overlap Jaccard scores against active challenges, adds geographic match bonuses (+2 points for matching locality, +1 point for matching district), and ranks top similar reports.",
        "2. <b>Atomic Report Merging Logic (`mergeChallenges`)</b>: When an admin merges a duplicate report into a primary challenge, the duplicate's `mergedInto` pointer is set to the primary challenge ID. The duplicate's votes (`survivor.votesCount += duplicate.votesCount`) and affected citizens (`survivor.affectedCount += duplicate.affectedCount`) are atomically transferred, and audit notes are logged in `statusHistory` for both reports. Public query filters automatically hide merged reports (`mergedInto == null`).",
        "3. <b>5-Stage Status Audit Machine</b>: Enforces status progression (`Pending` → `Open` → `Under Review` → `In Progress` → `Resolved`). Every status change appends a historic record into `statusHistory` storing `status`, `changedBy`, `changedAt`, and `note`, guaranteeing 100% auditability.",
        "4. <b>Atomic Vote Deduplication</b>: Enforces compound unique index `{ challenge: 1, user: 1 }` on `Vote` schema. Handles MongoDB duplicate key error code `11000` gracefully to prevent double voting or race conditions."
    ]
    for algo in algos:
        story.append(Paragraph(algo, s['body']))

    story.append(Spacer(1, 8))

    # 4. REST API Endpoint Table
    story.append(Paragraph("4. Complete REST API Endpoint Reference", s['h1']))
    api_rows = [
        [Paragraph("<b>HTTP Method & Path</b>", s['table_header']), Paragraph("<b>Access Level</b>", s['table_header']), Paragraph("<b>Functionality & Output</b>", s['table_header'])],
        [Paragraph("POST /api/auth/register", s['table_body']), Paragraph("Public", s['table_body']), Paragraph("Registers user, hashes password & returns user profile + JWT token.", s['table_body'])],
        [Paragraph("POST /api/auth/login", s['table_body']), Paragraph("Public", s['table_body']), Paragraph("Authenticates credentials & returns user profile + JWT token.", s['table_body'])],
        [Paragraph("GET /api/challenges", s['table_body']), Paragraph("Public", s['table_body']), Paragraph("Fetches approved public challenges filtered by status/category/location.", s['table_body'])],
        [Paragraph("POST /api/challenges", s['table_body']), Paragraph("Private (Citizen)", s['table_body']), Paragraph("Creates new challenge with coordinates & evidence photos in Pending state.", s['table_body'])],
        [Paragraph("GET /api/challenges/similar", s['table_body']), Paragraph("Public", s['table_body']), Paragraph("Runs duplicate algorithm & returns ranked similar challenge candidates.", s['table_body'])],
        [Paragraph("POST /api/challenges/:id/vote", s['table_body']), Paragraph("Private", s['table_body']), Paragraph("Atomically records user upvote & increments challenge votes count.", s['table_body'])],
        [Paragraph("POST /api/challenges/:id/proposals", s['table_body']), Paragraph("Private (Institution)", s['table_body']), Paragraph("Submits technical solution proposal & advances status to Under Review.", s['table_body'])],
        [Paragraph("PATCH /api/challenges/:id/status", s['table_body']), Paragraph("Private (Admin)", s['table_body']), Paragraph("Updates challenge lifecycle status & appends audit entry to history.", s['table_body'])],
        [Paragraph("POST /api/challenges/:id/merge", s['table_body']), Paragraph("Private (Admin)", s['table_body']), Paragraph("Merges duplicate report into primary issue & transfers vote counts.", s['table_body'])]
    ]
    t_api = Table(api_rows, colWidths=[140, 100, 264])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#ECFDF5")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#A7F3D0")),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5), ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 10))

    # 5. Top 10 Technical Q&A for Evaluators
    story.append(Paragraph("5. Top 10 Technical Presentation Q&As (Backend)", s['h1']))

    qa10_backend = [
        ("Q1: How does the server handle MongoDB database connectivity in environments without local MongoDB installed?",
         "<b>Answer:</b> In `config/db.js`, the server first attempts connecting to the standard MongoDB URI (`process.env.MONGO_URI` or `mongodb://127.0.0.1:27017/samadhan-setu`). If local MongoDB is unavailable or fails to connect, the server catches the error and automatically spawns `MongoMemoryServer` (an in-memory MongoDB server). This allows the entire backend to start up instantly with zero external database configuration, seeding demo accounts automatically."),

        ("Q2: How does the duplicate detection algorithm work?",
         "<b>Answer:</b> The duplicate engine (`findSimilarChallenges` in `challengeController.js`) receives query parameters (`title`, `category`, `district`, `locality`). It tokenizes and normalizes words using regular expressions and a custom `STOP_WORDS` set. It then performs a candidate search, scoring candidate challenges based on title word overlap (Jaccard-like keyword matching) plus geographic match bonuses (+2 for matching locality, +1 for matching district). Candidates scoring highest are returned to the frontend."),

        ("Q3: How is security and Role-Based Access Control (RBAC) enforced in the API routes?",
         "<b>Answer:</b> Express route middleware (`authMiddleware.js`) enforces security in layers: `protect` decodes the JWT bearer token from the `Authorization` header, verifies its signature using `process.env.JWT_SECRET`, and attaches `req.user`. Specialized middleware (`adminOnly`, `institutionOnly`) inspects `req.user.role`. If a user with role `citizen` tries to access `/api/admin` or `/api/challenges/:id/status`, the middleware blocks the request with HTTP `403 Forbidden`."),

        ("Q4: How does the report merging mechanism preserve vote data and maintain data integrity?",
         "<b>Answer:</b> When an admin calls `POST /api/challenges/:id/merge` with `duplicateId`, the controller verifies both reports exist and that neither has already been merged. It sets `duplicate.mergedInto = survivor._id`, transfers all votes (`survivor.votesCount += duplicate.votesCount`), adds affected citizen counts (`survivor.affectedCount += duplicate.affectedCount`), and logs audit notes in `statusHistory` for both challenges. Future queries for public challenges filter out reports where `mergedInto != null`."),

        ("Q5: How are file uploads (photos & evidence) processed and stored?",
         "<b>Answer:</b> We configure `multer` in `routes/challengeRoutes.js` with `diskStorage`, storing uploads in the backend `/uploads` directory with unique timestamped filenames (`Date.now() + '-' + originalName`). Multer file filters enforce image mime-types (`image/jpeg`, `image/png`, `image/webp`). Express serves these statically via `app.use('/uploads', express.static(path.join(__dirname, 'uploads')))`, returning relative file paths (e.g. `/uploads/1724889600000-photo.jpg`) in JSON API responses."),

        ("Q6: How do you prevent double-upvoting or race conditions during voting?",
         "<b>Answer:</b> At the database level, the `Vote` collection enforces a compound unique index on `{ challenge: 1, user: 1 }`. When a vote request arrives, `Vote.create()` is executed inside a `try/catch` block. If a duplicate vote is attempted simultaneously, MongoDB rejects the write with error code `11000` (Duplicate Key Error), which our controller catches to return a clean `400 Bad Request` without corrupting vote counters."),

        ("Q7: How are latitude and longitude geospatial coordinates stored and validated?",
         "<b>Answer:</b> In `models/Challenge.js`, `latitude` and `longitude` are defined as `Number` fields initialized to `null`. During challenge creation in `challengeController.js`, input values are validated to ensure they are numeric floats, sanitizing coordinates before storage. These coordinates are exposed in JSON payloads to feed the frontend Leaflet map engine."),

        ("Q8: How is password storage secured?",
         "<b>Answer:</b> Passwords are never stored in plaintext. In `seed.js` and `authController.js`, passwords pass through `bcryptjs.genSalt(10)` and `bcryptjs.hash()`. During login, `bcryptjs.compare()` checks submitted plaintext passwords against the stored hash without ever exposing raw password strings."),

        ("Q9: What is the structure of the 5-stage status audit trail (`statusHistory`)?",
         "<b>Answer:</b> `statusHistory` is an embedded schema array inside `Challenge.js` containing objects with fields `{ status, changedBy, changedAt, note }`. Whenever an admin or automated lifecycle event triggers a status update (e.g. `Pending` -> `Open`), a new audit object is appended to the array, ensuring complete historical traceability of who changed status and why."),

        ("Q10: How does the server handle centralized error logging and unexpected runtime failures?",
         "<b>Answer:</b> `server.js` registers a centralized error handling middleware `(err, req, res, next)` at the bottom of the middleware chain. Any error thrown in asynchronous controller handlers or passed via `next(err)` is logged to standard error (`console.error`), returning a standardized JSON error object `{ message, error }` with appropriate HTTP status codes (400, 401, 403, 404, 500).")
    ]

    for q, a in qa10_backend:
        story.append(Paragraph(q, s['q_title']))
        story.append(Paragraph(a, s['a_body']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated {filename}")

if __name__ == "__main__":
    build_full_frontend_pdf("/Users/ayushranjan/sih/Frontend_Tech_Guide.pdf")
    build_full_backend_pdf("/Users/ayushranjan/sih/Backend_Tech_Guide.pdf")
