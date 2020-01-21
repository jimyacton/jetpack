/**
 * External Dependencies
 */
import 'url-polyfill';
import { isEqual } from 'lodash';
import queryString from 'query-string';

/**
 * WordPress dependencies
 */
import { BlockControls, BlockIcon, InspectorControls } from '@wordpress/block-editor';
import {
	Button,
	ExternalLink,
	Notice,
	PanelBody,
	Placeholder,
	ToggleControl,
	Toolbar,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import icon from './icon';
import attributeDetails from './attributes';
import { getValidatedAttributes } from '../../shared/get-validated-attributes';
import SubmitButton from '../../shared/submit-button';
import { getAttributesFromEmbedCode } from './utils';
import BlockStylesPreviewAndSelector from './blockStylesPreviewAndSelector';

export default function CalendlyEdit( { attributes, className, clientId, setAttributes } ) {
	const validatedAttributes = getValidatedAttributes( attributeDetails, attributes );

	if ( ! isEqual( validatedAttributes, attributes ) ) {
		setAttributes( validatedAttributes );
	}

	const {
		backgroundColor,
		submitButtonText,
		hideEventTypeDetails,
		primaryColor,
		textColor,
		style,
		url,
	} = validatedAttributes;
	const [ embedCode, setEmbedCode ] = useState( '' );
	const [ notice, setNotice ] = useState();

	const setErrorNotice = () =>
		setNotice(
			<>
				{ __(
					"Your calendar couldn't be embedded. Please double check your URL or code.",
					'jetpack'
				) }
			</>
		);

	const parseEmbedCode = event => {
		if ( ! event ) {
			setErrorNotice();
			return;
		}

		event.preventDefault();

		const newAttributes = getAttributesFromEmbedCode( embedCode );
		if ( ! newAttributes ) {
			setErrorNotice();
			return;
		}

		const newValidatedAttributes = getValidatedAttributes( attributeDetails, newAttributes );

		setAttributes( newValidatedAttributes );
	};

	const embedCodeForm = (
		<form onSubmit={ parseEmbedCode }>
			<input
				type="text"
				id="embedCode"
				onChange={ event => setEmbedCode( event.target.value ) }
				placeholder={ __( 'Calendly web address or embed code…', 'jetpack' ) }
				value={ embedCode }
				className="components-placeholder__input"
			/>
			<div>
				<Button isSecondary isLarge type="submit">
					{ _x( 'Embed', 'button label', 'jetpack' ) }
				</Button>
			</div>
			<div className={ `${ className }-learn-more` }>
				<ExternalLink
					href="https://help.calendly.com/hc/en-us/articles/223147027-Embed-options-overview"
					target="_blank"
				>
					{ __( 'Need help finding your embed code?', 'jetpack' ) }
				</ExternalLink>
			</div>
		</form>
	);

	const blockPlaceholder = (
		<Placeholder
			label={ __( 'Calendly', 'jetpack' ) }
			instructions={ __( 'Enter your Calendly web address or embed code below.', 'jetpack' ) }
			icon={ <BlockIcon icon={ icon } /> }
			notices={
				notice && (
					<Notice status="error" isDismissible={ false }>
						{ notice }
					</Notice>
				)
			}
		>
			{ embedCodeForm }
		</Placeholder>
	);

	const iframeSrc = () => {
		const query = queryString.stringify( {
			embed_domain: 'wordpress.com',
			embed_type: 'Inline',
			hide_event_type_details: hideEventTypeDetails ? 1 : 0,
			background_color: backgroundColor,
			primary_color: primaryColor,
			text_color: textColor,
		} );
		return `${ url }?${ query }`;
	};

	const inlinePreview = (
		<>
			<div className={ `${ className }-overlay` }></div>
			<iframe
				src={ iframeSrc() }
				width="100%"
				height="100%"
				frameBorder="0"
				data-origwidth="100%"
				data-origheight="100%"
				style={ { minWidth: '320px', height: '630px', width: '100%' } }
				title="Calendly"
			></iframe>
		</>
	);

	const submitButtonPreview = (
		<SubmitButton
			submitButtonText={ submitButtonText }
			attributes={ attributes }
			setAttributes={ setAttributes }
		/>
	);

	const linkPreview = (
		<>
			<a style={ { alignSelf: 'flex-start', border: 'none' } } className="wp-block-button__link">
				{ submitButtonText }
			</a>
		</>
	);

	const blockPreview = ( previewStyle, disabled ) => {
		if ( previewStyle === 'inline' ) {
			return inlinePreview;
		}

		if ( disabled ) {
			return linkPreview;
		}

		return submitButtonPreview;
	};

	const styleOptions = [
		{ name: 'inline', label: __( 'Inline', 'jetpack' ) },
		{ name: 'link', label: __( 'Link', 'jetpack' ) },
	];

	const blockControls = (
		<BlockControls>
			{ url && (
				<Toolbar
					isCollapsed={ true }
					icon="admin-appearance"
					label={ __( 'Style', 'jetpack' ) }
					controls={ styleOptions.map( styleOption => ( {
						title: styleOption.label,
						isActive: styleOption.name === style,
						onClick: () => setAttributes( { style: styleOption.name } ),
					} ) ) }
					popoverProps={ { className: 'is-calendly' } }
				/>
			) }
		</BlockControls>
	);

	const inspectorControls = (
		<InspectorControls>
			{ url && (
				<>
					<PanelBody title={ __( 'Styles', 'jetpack' ) }>
						<BlockStylesPreviewAndSelector
							clientId={ clientId }
							styleOptions={ styleOptions }
							onSelectStyle={ setAttributes }
							activeStyle={ style }
							attributes={ attributes }
						/>
					</PanelBody>
				</>
			) }

			<PanelBody title={ __( 'Calendar Settings', 'jetpack' ) } initialOpen={ false }>
				<form onSubmit={ parseEmbedCode } className={ `${ className }-embed-form-sidebar` }>
					<input
						type="text"
						id="embedCode"
						onChange={ event => setEmbedCode( event.target.value ) }
						placeholder={ __( 'Calendly web address or embed code…', 'jetpack' ) }
						value={ embedCode }
						className="components-placeholder__input"
					/>
					<div>
						<Button isSecondary isLarge type="submit">
							{ _x( 'Embed', 'button label', 'jetpack' ) }
						</Button>
					</div>
				</form>

				<ToggleControl
					label={ __( 'Hide Event Type Details', 'jetpack' ) }
					checked={ hideEventTypeDetails }
					onChange={ () => setAttributes( { hideEventTypeDetails: ! hideEventTypeDetails } ) }
				/>
			</PanelBody>
		</InspectorControls>
	);

	return (
		<>
			{ inspectorControls }
			{ blockControls }
			{ url ? blockPreview( style ) : blockPlaceholder }
		</>
	);
}
