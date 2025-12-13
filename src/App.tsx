function App() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">AI-Driven Workflow Editor</h1>
      </header>
      <main className="flex-1 flex">
        <aside className="w-64 bg-gray-100 p-4">
          {/* Toolbar will go here */}
          <p>Toolbar</p>
        </aside>
        <section className="flex-1 bg-white">
          {/* Canvas will go here */}
          <p>Canvas Area</p>
        </section>
      </main>
    </div>
  )
}

export default App
