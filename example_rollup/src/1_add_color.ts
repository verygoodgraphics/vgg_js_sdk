import { DesignDocument } from 'vgg-sdk';
import { VggFormat, Color, GraphicsContextSettings1, Style, Fill } from 'vgg-sdk/dist/design_document_types'

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
	// console.log("document now is: ", doc);
}

testAddColor();
