# Contributing to ScrollForge

Thank you for your interest in contributing to ScrollForge! 🔥

## Development Setup

```bash
# Clone the repository
git clone https://github.com/scrollforge/scrollforge.git
cd scrollforge

# Install dependencies
npm install

# Start development build
npm run dev

# Run examples
cd examples/counter
# Open index.html in browser
```

## Project Structure

```
scrollforge/
├── src/
│   ├── script/          # ScrollScript engine
│   │   ├── core.js      # Universal core
│   │   ├── client.js    # Browser runtime
│   │   └── server.js    # Node.js runtime
│   ├── weave/           # ScrollWeave engine
│   │   └── core.js      # Styling engine
│   ├── mesh/            # ScrollMesh engine
│   │   └── core.js      # Component assembly
│   └── index.js         # Main integration
├── cli/                 # CLI tools
├── examples/            # Example applications
└── dist/                # Built files
```

## Making Changes

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test your changes** with the examples
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## Code Style

- Use modern JavaScript (ES6+)
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and small

## Testing

Test your changes with the example applications:

```bash
cd examples/counter
# Open in browser and test

cd examples/scroll-navigator
# Open in browser and test

cd examples/todo-mvc
# Open in browser and test
```

## Documentation

If you add new features:
- Update README.md
- Add examples
- Update GETTING_STARTED.md if needed

## Questions?

Open an issue or discussion on GitHub!

---

🔥 **Thank you for contributing to ScrollForge!** 🔥

