// This may seem silly, but I use this as a marker for any 'Message' classes
// which are sent from client.
// The idea is to put related generic parameter to every client method, so not to forget
// or mistype any of the message properties. For this, any Message derived types must be put 
// to separate files as well.
export interface Message {

}