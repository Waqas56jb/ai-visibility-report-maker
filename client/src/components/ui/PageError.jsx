import { Component } from 'react';

export default class PageError extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="card panel">
          <h3>Something went wrong</h3>
          <p className="muted">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
