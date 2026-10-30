import { ArrowUpRight, BookOpen, Github, Network, Sparkles } from 'lucide-react';

export default function Header({ onInfo, repoUrl }) {
  return (
    <header className="topbar">
      <div className="brand-group">
        <div className="brand-icon" aria-hidden="true"><Network size={25} strokeWidth={2.15} /></div>
        <div className="brand-copy">
          <div className="brand-heading">Path<span>Forge</span><span className="brand-beta">STUDIO</span></div>
          <p>Visualize Algorithms. Discover the Shortest Path.</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="header-pill"><Sparkles size={13} /> INTERACTIVE ALGORITHM LAB</div>
        <button type="button" className="btn btn-ghost header-info" onClick={onInfo} title="Open algorithm reference">
          <BookOpen size={16} /><span>Algorithm guide</span>
        </button>
        {repoUrl && (
          <a className="btn btn-ghost" href={repoUrl} target="_blank" rel="noopener noreferrer" title="View project on GitHub">
            <Github size={17} /><span className="github-label">GitHub</span><ArrowUpRight size={13} />
          </a>
        )}
      </div>
    </header>
  );
}
