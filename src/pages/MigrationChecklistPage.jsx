const checklist = [
  'Map every PHP page to one React route',
  'Move repeated PHP includes (header/footer/sidebar) into reusable components',
  'Convert form POST/GET handling to React state + fetch calls',
  'Replace PHP session checks with frontend auth state + backend API validation',
  'Move CSS/JS assets into src/assets or public and update import paths',
]

function MigrationChecklistPage() {
  return (
    <section className="card">
      <h2>Migration Checklist</h2>
      <p>Use this flow for each file from htdocs.</p>
      <ol className="checklist">
        {checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  )
}

export default MigrationChecklistPage
