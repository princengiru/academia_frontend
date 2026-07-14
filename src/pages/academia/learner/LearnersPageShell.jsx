function LearnersPageShell({ title, description, children }) {
  return (
    <section>
      {title ? (
        <header>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </header>
      ) : null}

      {children}
    </section>
  );
}

export default LearnersPageShell;
