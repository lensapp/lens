export interface Channel<MessageTemplate = void, ReturnTemplate = void> {
  id: string;
  _messageTemplate?: MessageTemplate;
  _returnTemplate?: ReturnTemplate;
}
