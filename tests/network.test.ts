// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import { Connection } from '../client/src/network';
class Socket extends EventTarget {
  static OPEN = 1;
  readyState = 1;
  sent: any[] = [];
  constructor(_url: string) { super(); }
  send(s: string) { this.sent.push(JSON.parse(s)); }
  close() {}
  message(msg: unknown) { this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(msg) })); }
}
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
it.each(['room_closed', 'error'])('clears an expired room and notifies the UI for %s', (type) => {
  vi.stubGlobal('WebSocket', Socket);
  localStorage.setItem('arena-room', 'expired');
  const connection = new Connection();
  const received: any[] = [];
  connection.addEventListener('data', (e) => received.push((e as CustomEvent).detail));
  connection.connect();
  const socket = connection.ws as unknown as Socket;
  socket.message({ type: 'hello', token: 'safe-test-token', id: 'me' });
  expect(socket.sent.at(-1)).toEqual({ type: 'join', roomId: 'expired' });
  socket.message({ type, roomId: 'expired', message: '방을 찾을 수 없습니다.' });
  expect(connection.roomId).toBe('');
  expect(localStorage.getItem('arena-room')).toBeNull();
  expect(received.at(-1).type).toBe('room_closed');
});
