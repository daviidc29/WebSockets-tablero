// URL del WebSocket según HTTP/HTTPS
function BBServiceURL() {
  var isHttps = window.location.protocol === 'https:';
  var proto = isHttps ? 'wss://' : 'ws://';
  var host = window.location.host; // ip:puerto o dominio
  var url = proto + host + '/bbService';
  console.log('URL WS:', url);
  return url;
}

// Canal WS simple
class WSBBChannel {
  constructor(URL, callback) {
    this.URL = URL;
    this.wsocket = new WebSocket(URL);
    this.receivef = callback;

    this.wsocket.onopen    = (evt) => this.onOpen(evt);
    this.wsocket.onmessage = (evt) => this.onMessage(evt);
    this.wsocket.onerror   = (evt) => this.onError(evt);
    this.wsocket.onclose   = (evt) => this.onClose(evt);
  }
  onOpen(evt)    { console.log("WS open:", evt); }
  onMessage(evt) {
    // Ignorar handshake
    if (evt.data !== "Connection established.") {
      this.receivef(evt.data);
    }
  }
  onError(evt)   { console.error("WS error:", evt); }
  onClose(evt)   { console.log("WS closed:", evt); }

  send(x, y) {
    var msg = JSON.stringify({ x: x, y: y });
    this.wsocket.send(msg);
  }
}

function BBCanvas() {
  const [svrStatus, setSvrStatus] = React.useState({ loadingState: 'Loading Canvas...' });
  const comunicationWS = React.useRef(null);
  const myp5 = React.useRef(null);

  // Dibuja un punto recibido remotamente
  function drawPoint(x, y) {
    if (!myp5.current) return;
    myp5.current.fill(0);
    myp5.current.ellipse(x, y, 20, 20);
  }

  React.useEffect(function () {
    // p5 viene del CDN global
    const P5 = p5;

    // Definimos el sketch dentro para acceder a comunicationWS
    const sketch = function (p) {
      p.setup = function () {
        p.createCanvas(700, 410);
        p.background(255);
      };
      p.draw = function () {
        if (p.mouseIsPressed === true) {
          p.fill(0);
          p.ellipse(p.mouseX, p.mouseY, 20, 20);

          // Enviar punto por WS si está abierto
          if (comunicationWS.current && comunicationWS.current.wsocket && comunicationWS.current.wsocket.readyState === WebSocket.OPEN) {
            comunicationWS.current.send(p.mouseX, p.mouseY);
          }
        } else {
          p.fill(255);
        }
      };
    };

    // Montar canvas
    myp5.current = new P5(sketch, 'container');
    setSvrStatus({ loadingState: 'Canvas Loaded' });

    // Conectar WS y registrar callback de recepción
    comunicationWS.current = new WSBBChannel(BBServiceURL(), function (msg) {
      const obj = JSON.parse(msg);
      drawPoint(obj.x, obj.y);
    });

    // Limpieza al desmontar
    return function () {
      console.log("closing connection");
      try {
        if (comunicationWS.current && comunicationWS.current.wsocket) {
          comunicationWS.current.wsocket.close();
        }
      } catch (e) {
        console.error("Error closing WebSocket:", e);
      }
      try {
        if (myp5.current && typeof myp5.current.remove === 'function') {
          myp5.current.remove();
        }
      } catch (e) {
        console.error("Error removing p5 instance:", e);
      }
    };
  }, []);

  return <h4>Drawing status: {svrStatus.loadingState}</h4>;
}

function Editor(props) {
  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1>Hello, {props.name}</h1>
      <hr />
      <div id="toolstatus"></div>
      <hr />
      <div id="container">
        <BBCanvas />
      </div>
      <hr />
      <div id="info"></div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Editor name="David" />);