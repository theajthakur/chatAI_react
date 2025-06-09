import { useParams } from "react-router-dom";
import "../assets/css/terminal.css";
export default function Terminal() {
  const roomId = useParams("roomid");
  console.log(roomId);
  return (
    <div className="terminal-container">
      <div className="terminal">
        <div className="header">
          <div className="left">
            <i className="bi bi-terminal"></i>
            <span className="title">Terminal Chat</span>
          </div>
          <div className="right">
            <button>
              <i className="bi bi-house"></i>
            </button>
            <button>
              <i className="bi bi-gear"></i>
            </button>
            <button>
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="body">
          <div className="message">
            <div className="meta">
              <span className="name">Alice</span>
              <span className="time">10:15 AM</span>
            </div>
            <div className="text">Hello, how are you?</div>
          </div>
          <div className="message">
            <div className="meta">
              <span className="name">Bob</span>
              <span className="time">10:16 AM</span>
            </div>
            <div className="text">Doing great! You?</div>
          </div>
        </div>

        <div className="footer">
          <input type="text" placeholder="Type a message..." />
          <button>
            <i className="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
