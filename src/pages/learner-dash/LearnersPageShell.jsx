function LearnersPageShell({ title, description, children }) {
  return (
    <section>
      <header>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>

      {children}
    </section>
  );
}

export default LearnersPageShell;