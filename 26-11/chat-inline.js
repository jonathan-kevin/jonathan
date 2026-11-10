// Static inline chat shell. Only opening, closing and resizing are active.
(() => {
 class InlineChat extends HTMLElement {
  connectedCallback() {
   if (this.panel) { this.panel.connect(); return; }
   this.panel = new window.SaInlinePanel(this, { onDismiss: () => this.close() });
   const origin = document.querySelector(`.saOpenChat[aria-controls="${this.id}"]`);
   // Start open without moving keyboard focus away from the page.
   this.panel.open(origin, null);
  }
  disconnectedCallback() { this.panel?.disconnect(); }
  open(origin) { this.panel.open(origin); }
  close(origin = this.panel.origin) { this.panel.close(origin); }
 }
 if (!customElements.get("chat-inline")) customElements.define("chat-inline", InlineChat);
 document.addEventListener("click", event => {
  const button = event.target.closest(".saOpenChat[aria-controls]");
  if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
  const chat = document.getElementById(button.getAttribute("aria-controls"));
  if (!chat?.matches("chat-inline")) return;
  event.preventDefault();
  if (chat.hidden) chat.open(button);
  else chat.close(button);
 });
})();