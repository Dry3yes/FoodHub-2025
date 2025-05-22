import "../styles/DocumentItem.css"

function DocumentItem({ title }) {
  return (
    <div className="document-item">
      <div className="document-left">
        <div className="image-circle document-icon">
          {/* You can add your document icon image here later */}
          <div className="placeholder-text">DOC</div>
        </div>
      </div>

      <div className="document-title">{title}</div>

      <div className="document-right">
        <div className="image-circle document-action">
          {/* You can add your action icon image here later */}
          <div className="placeholder-text">+</div>
        </div>
      </div>
    </div>
  )
}

export default DocumentItem
