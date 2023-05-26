import { DesignDocument, EventListenerNode } from 'vgg-sdk';
import { VggFormat } from 'vgg-sdk/dist/design_document_types'

async function test() {
	// Given
	const doc = await DesignDocument.getDesignDocument() as VggFormat;
	let tmpNode: any = doc.artboard[0].layers[0].childObjects[0];
	let node: EventListenerNode = tmpNode;

	// When
	const listener_code = 'console.log("hello")';
	const event_type = 'click';

	// When
	node.addEventListener(event_type, listener_code);

	// Then
	let listeners = node.getEventListeners();
	if (listeners[event_type][0].listener !== listener_code) {
		throw new Error('add or get failed');
	}

	// When
	node.removeEventListener(event_type, listener_code);
	listeners = node.getEventListeners();
	if (listeners[event_type].length !== 0) {
		throw new Error('remove failed');
	}
}

test();
