-- =====================================================================
--  DEMO COURSE SEED  ·  "Complete Modern React Developer" (UPGRADED)
--  Flow mirrored: BasicInfo -> Curriculum (weeks/chapters/exercises) -> Pricing
--
--  Notes:
--   - Single quotes inside text are escaped with two single quotes ('').
--   - Descriptions and content are rich with HTML for a beautiful frontend render.
--   - JSON structures are strictly formatted.
-- =====================================================================

-- ---------- 0) CLEANUP (safe re-run) ----------
-- Your first run partially inserted the course/weeks/chapters before the
-- exercises failed. These DELETEs remove any leftovers so the whole file can
-- be re-run in one shot without duplicate-key errors. Child rows go first.
DELETE FROM exercises WHERE chapter_id BETWEEN 301 AND 306;
DELETE FROM chapters  WHERE id BETWEEN 301 AND 306;
DELETE FROM weeks     WHERE id BETWEEN 201 AND 203;
DELETE FROM courses   WHERE id = 101;

-- ---------- 1) COURSE (BasicInfo + Pricing payloads) ----------
INSERT INTO courses
  (id, instructor_id, title, subtitle, description, intro_message,
   category_id, category, level, education_level, language,
   duration_weeks, required_hours_per_week, target_audience, objectives,
   thumbnail_url, review_status, status, status_approval, price, subscription_price)
VALUES
  (101, 15,
   'Complete Modern React Developer',
   'Master React, Hooks, and real-world data fetching from scratch to production.',
   '<h3>The definitive guide to building modern web applications.</h3><p>React has completely transformed the way we build user interfaces. In this comprehensive, project-driven course, you will move beyond the basics and learn how to think in React. We leave behind outdated class components and focus entirely on modern functional React, utilizing Hooks, context, and advanced state management techniques.</p><p>Through hands-on projects and carefully crafted theoretical lessons, you will learn how to break down complex UIs into independent, reusable components. You will master the intricacies of the Virtual DOM, discover how to manage side-effects gracefully, and learn industry-standard patterns for fetching and caching API data.</p><h4>What makes this course different?</h4><ul><li><strong>No fluff:</strong> We focus on the exact tools and patterns used in the industry today.</li><li><strong>Visual Learning:</strong> Complex concepts like component lifecycles and state propagation are explained with clear analogies and diagrams.</li><li><strong>Interactive Quizzes:</strong> Test your knowledge at every step to ensure the concepts actually stick.</li></ul>',
   '<h3>Welcome to the course!</h3><p>I am thrilled to have you here. Over the next few weeks, you are going to transform the way you think about front-end development. <strong>Your first step:</strong> Head over to Week 1, grab the setup cheat sheet, and let''s get your development environment ready. Consistency is key—try to dedicate at least an hour a day. Let''s build something amazing!</p>',
   1, 'Web Development', 'beginner', 'Beginner', 'English',
   3, 6,
   '<p>This course is designed for:</p><ul><li><strong>Aspiring Front-End Developers:</strong> Looking to build a professional portfolio using the industry''s most popular UI library.</li><li><strong>Traditional Web Developers:</strong> Transitioning from jQuery or vanilla JavaScript into modern SPA (Single Page Application) architecture.</li><li><strong>Students & Career Switchers:</strong> Seeking a structured, easy-to-follow path to modern web development.</li></ul><p><em>Prerequisites:</em> A solid understanding of basic HTML, CSS, and modern JavaScript (ES6 syntax like arrow functions, destructuring, and promises).</p>',
   '<ul><li>Architect scalable, maintainable React applications from scratch.</li><li>Master JSX syntax and the Virtual DOM rendering process.</li><li>Build highly reusable, composable function components.</li><li>Manage complex application state using <code>useState</code> and <code>useReducer</code>.</li><li>Handle side-effects and remote data fetching using <code>useEffect</code>.</li><li>Deploy robust React applications to production environments.</li></ul>',
   '/uploads/thumbnails/1780643351356-645296.png',
   'approved', 'published', 'approved', 89.99, 49.99);

-- ---------- 2) WEEKS (POST /courses/:id/weeks) ----------
INSERT INTO weeks
  (id, course_id, title, description, learning_objectives, week_number, duration_days)
VALUES
  (201, 101, 'Week 1: Thinking in React & Environment Setup',
   'In our first week, we will demystify what React actually is. We will set up a modern development environment using Vite, explore the Virtual DOM, and learn how to write elegant, declarative UI using JSX.',
   '["Understand the declarative vs imperative programming paradigms","Initialize a modern React project using Vite","Master the syntax and rules of JSX","Render dynamic data into the DOM"]', 1, 7),
  
  (202, 101, 'Week 2: The Component Architecture: Props & State',
   'This week is all about building blocks. We will learn how to split UI into isolated, reusable pieces called components. We will then breathe life into them by managing internal state and passing data down the tree using props.',
   '["Deconstruct complex UIs into component hierarchies","Pass data down the component tree via props","Initialize and update component state","Implement interactive event listeners (clicks, forms)"]', 2, 7),
  
  (203, 101, 'Week 3: Advanced Hooks & Remote Data Fetching',
   'Static apps are boring. In our final week, we will connect our React application to the outside world. We will dive deep into the useEffect hook, learn how to safely fetch data from REST APIs, and handle loading/error states.',
   '["Understand the React component lifecycle in a functional world","Safely perform side-effects with useEffect","Fetch, parse, and render live JSON data from an API","Handle network latency and error boundaries safely"]', 3, 7);

-- ---------- 3) CHAPTERS (POST /courses/:id/chapters) ----------
INSERT INTO chapters
  (id, course_id, week_id, week_number, title, subtitle, intro_message,
   video_url, duration, thumbnail, description, attachments, order_index)
VALUES
  -- Week 1
  (301, 101, 201, 1, 'The "Why" of React & Setup', 'Entering the modern front-end ecosystem',
   'Before we write code, we need to understand the problem React solves. Let''s set the stage.',
   'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 14, '/uploads/thumbnails/1780473898624-378190.png',
   '<h3>The Shift to Declarative UI</h3><p>Historically, web developers used imperative programming—manually finding DOM elements and telling the browser exactly how to update them (e.g., <code>document.getElementById(''btn'').classList.add(''active'')</code>). As applications grew, this became an unmanageable web of updates.</p><p>React introduced a <strong>declarative</strong> approach. You simply describe what the UI <em>should</em> look like based on the current data, and React figures out the most efficient way to update the DOM.</p><h4>Getting Started with Vite</h4><p>We will be using Vite to scaffold our project. It provides a lightning-fast development server and modern bundling. Open your terminal and run:</p><pre><code>npm create vite@latest my-react-app -- --template react\ncd my-react-app\nnpm install\nnpm run dev</code></pre><p>Download the attached Cheatsheet for a full breakdown of the folder structure.</p>',
   '[{"file_name":"react-setup-cheatsheet.pdf","file_path":"/uploads/documents/1782055596852-973261.pdf","file_type":"application/pdf"}]', 1),

  (302, 101, 201, 1, 'Mastering JSX', 'Writing HTML inside JavaScript',
   'It looks like HTML, but it comes with the full power of JavaScript. Let''s learn the rules of JSX.',
   '', 11, '/uploads/thumbnails/1780583702367-411000.png',
   '<h3>What exactly is JSX?</h3><p>JSX is a syntax extension for JavaScript. It allows us to write markup directly inside our JS files. Under the hood, a compiler (like Babel or SWC) transforms this markup into standard JavaScript objects (specifically, <code>React.createElement</code> calls).</p><h4>The Three Golden Rules of JSX:</h4><ol><li><strong>Return a single root element:</strong> To return multiple elements, wrap them in a parent tag or a Fragment (<code>&lt;&gt; ... &lt;/&gt;</code>).</li><li><strong>Close all tags:</strong> Unlike HTML, JSX is strict. Tags like <code>&lt;img&gt;</code> or <code>&lt;input&gt;</code> must be self-closed (e.g., <code>&lt;img src="..." /&gt;</code>).</li><li><strong>camelCase all most things:</strong> Attributes in JSX are written in camelCase. <code>class</code> becomes <code>className</code>, and <code>onclick</code> becomes <code>onClick</code>.</li></ol><p>You can embed any valid JavaScript expression inside JSX by wrapping it in curly braces <code>{}</code>.</p>',
   '[]', 2),

  -- Week 2
  (303, 101, 202, 2, 'Component Driven Development', 'Building reusable UI blocks',
   'Components are the fundamental building blocks of any React application.',
   'https://www.youtube.com/watch?v=SqcY0GlETPk', 16, '/uploads/thumbnails/1780642611823-550457.png',
   '<h3>Thinking in Components</h3><p>Imagine a standard website layout: a Navbar, a Sidebar, and a Main Content area. In React, each of these is a separate component. A component is essentially a JavaScript function that returns some JSX.</p><pre><code>export default function Button() {\n  return &lt;button className="primary"&gt;Click Me&lt;/button&gt;;\n}</code></pre><h4>Modularity and Reusability</h4><p>By keeping components small and focused on a single task, you can reuse them across your entire application. This keeps your codebase DRY (Don''t Repeat Yourself) and makes testing significantly easier. Check the attached diagram to see how data flows down the component tree.</p>',
   '[{"file_name":"component-tree-diagram.png","file_path":"/uploads/documents/1779956340927-6089.png","file_type":"image/png"}]', 1),

  (304, 101, 202, 2, 'Props vs. State', 'The engine of React interactivity',
   'If components are the body of React, Props and State are the heartbeat.',
   'https://www.youtube.com/watch?v=IYvD9oBCuJI', 18, '/uploads/thumbnails/1780646127959-451011.png',
   '<h3>Understanding the Difference</h3><p>The concepts of Props and State often confuse beginners, but they represent two very different ways data is handled in React.</p><ul><li><strong>Props (Properties):</strong> These are read-only arguments passed from a parent component to a child component. A child component can <em>never</em> modify its own props. They are immutable.</li><li><strong>State:</strong> This is a component''s personal, internal memory. State is mutable (changeable). When a component updates its state, React automatically re-renders that component to reflect the new data on the screen.</li></ul><p><strong>Rule of thumb:</strong> If a component needs to change the data over time (like a counter ticking up, or a text input being typed into), that data must be stored in <strong>State</strong>.</p>',
   '[]', 2),

  -- Week 3
  (305, 101, 203, 3, 'The useState & useEffect Hooks', 'Modern state management',
   'Hooks completely revolutionized React in 2018. Here is how to use the two most important ones.',
   'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 20, '/uploads/thumbnails/1780684972153-686836.png',
   '<h3>Introducing Hooks</h3><p>Before Hooks, function components were "stateless" and could only render UI based on props. Now, Hooks allow function components to "hook into" React features.</p><h4>1. useState</h4><p><code>const [count, setCount] = useState(0);</code><br>This hook returns an array with two items: the current state value, and a setter function to update it.</p><h4>2. useEffect</h4><p>React components should ideally be pure functions. But sometimes we need to step outside of React to interact with the real world (timers, DOM manipulation, network requests). These are called <strong>side effects</strong>.<br><br><code>useEffect(() =&gt; { /* do something */ }, [dependencies]);</code><br>The dependency array dictates exactly <em>when</em> the effect should re-run. Review the attached cheat sheet carefully to avoid infinite loops!</p>',
   '[{"file_name":"hooks-advanced-reference.pdf","file_path":"/uploads/documents/1783598010457-878627.pdf","file_type":"application/pdf"}]', 1),

  (306, 101, 203, 3, 'Fetching Real-World API Data', 'Bringing your app to life',
   'Learn how to communicate with external servers and handle asynchronous operations gracefully.',
   'https://www.youtube.com/watch?v=00lxm_dFGp8', 22, '/uploads/thumbnails/1780685050180-654257.png',
   '<h3>The Anatomy of a Fetch Request in React</h3><p>When fetching data, we usually need three pieces of state to track the request lifecycle:</p><ol><li><code>data</code>: To store the actual JSON payload.</li><li><code>isLoading</code>: A boolean to show a spinner while the network request is pending.</li><li><code>error</code>: To store error messages if the server crashes or the user goes offline.</li></ol><h4>Implementation</h4><p>We place our asynchronous <code>fetch()</code> call inside a <code>useEffect</code> hook with an empty dependency array <code>[]</code>, ensuring it only fires once when the component mounts. <em>Always remember to handle your `.catch()` blocks!</em> Download the sample JSON below to see the payload we will be working with in today''s coding exercise.</p>',
   '[{"file_name":"sample-users-api-response.pdf","file_path":"/uploads/documents/1783600090102-426865.pdf","file_type":"application/pdf"}]', 2);

-- ---------- 4) EXERCISES (POST /chapters/:id/exercises) ----------
INSERT INTO exercises
  (id, chapter_id, question, type, options, correct_answer, points, order_index)
VALUES
  -- Chapter 301 (Setup)
  (401, 301, 'What is the primary difference between Declarative and Imperative programming in the context of React?', 'radio',
   '[{"label":"Declarative means manually updating DOM nodes; Imperative means describing what the UI should look like.","value":"A","is_correct":false},{"label":"Declarative describes WHAT the UI should look like; Imperative describes step-by-step HOW to change the DOM.","value":"B","is_correct":true},{"label":"There is no difference; they are interchangeable terms.","value":"C","is_correct":false},{"label":"Declarative is used for backend databases, while Imperative is used for frontend UI.","value":"D","is_correct":false}]',
   'B', 1, 1),
  (402, 301, 'Which build tool are we utilizing in this course to scaffold our modern React application?', 'radio',
   '[{"label":"Create React App (Webpack)","value":"CRA","is_correct":false},{"label":"Gulp.js","value":"Gulp","is_correct":false},{"label":"Vite","value":"Vite","is_correct":true},{"label":"Browserify","value":"Browserify","is_correct":false}]',
   'Vite', 1, 2),

  -- Chapter 302 (JSX)
  (403, 302, 'Which of the following are strict rules when writing JSX? (Select all that apply)', 'checkbox',
   '[{"label":"You must return a single wrapping root element or Fragment.","value":"rule1","is_correct":true},{"label":"All HTML tags must be explicitly closed, including tags like <br> and <img>.","value":"rule2","is_correct":true},{"label":"You must use the word ''class'' instead of ''className'' for CSS.","value":"rule3","is_correct":false},{"label":"JavaScript variables can be embedded using curly braces {}.","value":"rule4","is_correct":true}]',
   'rule1, rule2, rule4', 2, 1),
  (404, 302, 'Explain in 2-3 sentences why we use className instead of class in JSX.', 'text',
   NULL, NULL, 5, 2),

  -- Chapter 303 (Components)
  (405, 303, 'A React component is fundamentally:', 'radio',
   '[{"label":"A specific type of HTML element provided by the browser.","value":"A","is_correct":false},{"label":"A JavaScript function (or class) that optionally accepts inputs and returns React elements (JSX).","value":"B","is_correct":true},{"label":"A CSS file that styles a portion of the webpage.","value":"C","is_correct":false},{"label":"A database schema model.","value":"D","is_correct":false}]',
   'B', 1, 1),

  -- Chapter 304 (Props vs State)
  (406, 304, 'If a parent component passes data to a child component, and the child needs to modify that data, how should it be handled?', 'radio',
   '[{"label":"The child should modify the prop directly using assignment (e.g., props.title = ''New Title'').","value":"A","is_correct":false},{"label":"The child should ignore the prop and use CSS to hide the old value.","value":"B","is_correct":false},{"label":"Props are read-only. The parent must pass down a state-updating function alongside the data for the child to call.","value":"C","is_correct":true},{"label":"React automatically converts props to state if you try to mutate them.","value":"D","is_correct":false}]',
   'C', 2, 1),
  (407, 304, 'Provide an example scenario where you would use State instead of Props.', 'text',
   NULL, NULL, 5, 2),

  -- Chapter 305 (Hooks)
  (408, 305, 'Look at this code: `const [theme, setTheme] = useState("light");`. What does the string "light" represent here?', 'radio',
   '[{"label":"The variable name for the setter function.","value":"A","is_correct":false},{"label":"The initial, starting value of the theme state when the component first renders.","value":"B","is_correct":true},{"label":"A read-only prop passed from a parent.","value":"C","is_correct":false},{"label":"An HTML id attribute.","value":"D","is_correct":false}]',
   'B', 1, 1),
  (409, 305, 'What happens if you provide an empty array `[]` as the second argument to `useEffect`?', 'radio',
   '[{"label":"The effect runs on every single render, causing an infinite loop.","value":"A","is_correct":false},{"label":"The effect never runs.","value":"B","is_correct":false},{"label":"The effect only runs exactly once, immediately after the component mounts to the screen.","value":"C","is_correct":true},{"label":"The code throws an error.","value":"D","is_correct":false}]',
   'C', 2, 2),

  -- Chapter 306 (Data Fetching)
  (410, 306, 'When fetching data in a component, why is it considered best practice to implement an `isLoading` state?', 'text',
   NULL, NULL, 5, 1),
  (411, 306, 'Which of the following belongs inside the useEffect hook?', 'checkbox',
   '[{"label":"Initiating a network fetch request.","value":"A","is_correct":true},{"label":"Setting up a setInterval timer.","value":"B","is_correct":true},{"label":"Returning the main JSX payload to be rendered.","value":"C","is_correct":false},{"label":"Directly updating the document title (document.title = ...).","value":"D","is_correct":true}]',
   'A, B, D', 2, 2);