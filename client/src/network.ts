export class Connection extends EventTarget {
  ws?: WebSocket;
  id = '';
  connected = false;
  roomId = localStorage.getItem('arena-room') ?? '';
  retry = 600;
  timer?: number;
  intentional = false;
  connect() {
    this.intentional = false;
    const override = import.meta.env.VITE_WS_URL;
    const url =
      override || `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/ws`;
    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', () => {
      this.send({
        type: 'hello',
        token: localStorage.getItem('arena-token') || undefined,
        name: localStorage.getItem('arena-name') || '여행자',
      });
    });
    this.ws.addEventListener('message', (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'hello') {
          localStorage.setItem('arena-token', msg.token);
          this.id = msg.id;
          this.connected = true;
          this.retry = 600;
          this.dispatchEvent(new CustomEvent('status', { detail: true }));
          if (this.roomId) this.send({ type: 'join', roomId: this.roomId });
        }
        if (msg.type === 'room') {
          this.roomId = msg.room.id;
          localStorage.setItem('arena-room', this.roomId);
        }
        if (msg.type === 'left' || msg.type === 'room_closed') {
          this.roomId = '';
          localStorage.removeItem('arena-room');
        }
        if (msg.type === 'error' && msg.message.includes('세션')) {
          localStorage.removeItem('arena-token');
          this.ws?.close();
        }
        if (msg.type === 'error' && msg.message.includes('방을 찾을')) {
          msg.type = 'room_closed';
          msg.roomId = this.roomId;
          this.roomId = '';
          localStorage.removeItem('arena-room');
        }
        this.dispatchEvent(new CustomEvent('data', { detail: msg }));
      } catch {
        this.dispatchEvent(
          new CustomEvent('data', {
            detail: { type: 'error', message: '서버 응답을 읽지 못했습니다.' },
          }),
        );
      }
    });
    this.ws.addEventListener('close', () => {
      this.connected = false;
      this.dispatchEvent(new CustomEvent('status', { detail: false }));
      if (!this.intentional) {
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => this.connect(), this.retry + Math.random() * 250);
        this.retry = Math.min(15000, this.retry * 1.8);
      }
    });
    this.ws.addEventListener('error', () => {});
  }
  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data));
    else
      this.dispatchEvent(
        new CustomEvent('data', {
          detail: { type: 'error', message: '서버에 연결 중입니다. 잠시 후 다시 시도해 주세요.' },
        }),
      );
  }
}
