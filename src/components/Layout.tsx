interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        {/* 这里可以放导航栏 */}
      </header>
      
      <main className="app-main">
        {children}
      </main>
      
      <footer className="app-footer">
        {/* 这里可以放页脚信息 */}
      </footer>
    </div>
  )
}

export default Layout 