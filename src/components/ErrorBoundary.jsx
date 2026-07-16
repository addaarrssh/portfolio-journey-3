import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Section failed to render:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="glass-card mx-auto flex max-w-xl flex-col items-center gap-2 p-8 text-center">
            <p className="font-display text-lg text-white">
              This section couldn't load.
            </p>
            <p className="text-sm text-white/60">
              Everything else on the page is unaffected.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
