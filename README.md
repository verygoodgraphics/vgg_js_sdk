# vgg-sdk
vgg-sdk is [VGG](https://verygoodgraphics.com/) SDK for JavaScript.


Use this sdk, developers can call vgg runtime api, edit vgg model, etc.


# Usage

## Edit design document
```ts
import { DesignDocument } from '@verygoodgraphics/vgg-sdk';
import { VggFormat, Color, GraphicsContextSettings1, Style, Fill } from '@verygoodgraphics/vgg-sdk/dist/design_document_types'

async function testAddColor() {
	// Given
	const doc = await DesignDocument.getDesignDocument() as VggFormat;
	let theStyle: Style = doc.artboard[0].layers[0].childObjects[0].style;

	let newColor: Color = { class: 'color', alpha: 0.5, red: 0.5, green: 0.5, blue: 0.5 };
	let contextSetting: GraphicsContextSettings1 = {
		class: 'graphicsContextSettings',
		blendMode: 0,
		opacity: 0.5,
		isolateBlending: true,
		transparencyKnockoutGroup: 0
	};
	let aFill: Fill = {
		class: 'fill', isEnabled: true, color: newColor, fillType: 0,
		contextSettings: contextSetting
	};

	// When
	try {
		theStyle.fills.push(aFill);
	}
	catch (error) {
		console.log("error: ", error);
	}
	// Then
	console.log("document now is: ", doc);
}

testAddColor();

```


## Edit event listeners
```ts
import { DesignDocument, EventListenerNode } from '@verygoodgraphics/vgg-sdk';
import { VggFormat } from '@verygoodgraphics/vgg-sdk/dist/design_document_types'

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
	console.log('listeners after adding are: ', listeners);
	if (listeners[event_type][0].listener !== listener_code) {
		throw new Error('add or get failed');
	}

	// When
	node.removeEventListener(event_type, listener_code);
	listeners = node.getEventListeners();
	console.log('listeners after removal are: ', listeners);
	if (listeners[event_type].length !== 0) {
		throw new Error('remove failed');
	}
}

test();

```