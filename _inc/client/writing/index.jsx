/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getModule } from 'state/modules';
import { getSettings } from 'state/settings';
import { userCanManageModules } from 'state/initial-state';
import { isDevMode, isUnavailableInDevMode, isCurrentUserLinked } from 'state/connection';
import { userCanEditPosts } from 'state/initial-state';
import { isModuleActivated, getModuleOverride } from 'state/modules';
import { isModuleFound } from 'state/search';
import { getConnectUrl } from 'state/connection';
import QuerySite from 'components/data/query-site';
import Composing from './composing';
import CustomContentTypes from './custom-content-types';
import ThemeEnhancements from './theme-enhancements';
import PostByEmail from './post-by-email';
import { Masterbar } from './masterbar';
import { isAtomicSite } from 'state/initial-state';

export class Writing extends React.Component {
	static displayName = 'WritingSettings';

	render() {
		const commonProps = {
			settings: this.props.settings,
			getModule: this.props.module,
			isDevMode: this.props.isDevMode,
			isUnavailableInDevMode: this.props.isUnavailableInDevMode,
			isLinked: this.props.isLinked,
			getModuleOverride: this.props.getModuleOverride,
		};

		const found = [
			'copy-post',
			'masterbar',
			'markdown',
			'after-the-deadline',
			'custom-content-types',
			'post-by-email',
			'infinite-scroll',
			'minileven',
		].some( this.props.isModuleFound );

		if ( ! this.props.searchTerm && ! this.props.active ) {
			return null;
		}

		if ( ! found ) {
			return null;
		}

		const showComposing =
				this.props.userCanManageModules ||
				( this.props.userCanEditPosts && this.props.isModuleActivated( 'after-the-deadline' ) ),
			showPostByEmail =
				this.props.userCanManageModules ||
				( this.props.userCanEditPosts && this.props.isModuleActivated( 'post-by-email' ) );

		return (
			<div>
				<QuerySite />

				<Card
					title={ __(
						'Compose content the way you want to and streamline your publishing experience.'
					) }
					className="jp-settings-description"
				/>

				{ this.props.isModuleFound( 'masterbar' ) && ! this.props.masterbarIsAlwaysActive && (
					<Masterbar connectUrl={ this.props.connectUrl } { ...commonProps } />
				) }
				{ showComposing && (
					<Composing { ...commonProps } userCanManageModules={ this.props.userCanManageModules } />
				) }
				{ this.props.isModuleFound( 'custom-content-types' ) && (
					<CustomContentTypes { ...commonProps } />
				) }
				<ThemeEnhancements { ...commonProps } />
				{ this.props.isModuleFound( 'post-by-email' ) && showPostByEmail && (
					<PostByEmail
						{ ...commonProps }
						connectUrl={ this.props.connectUrl }
						isLinked={ this.props.isLinked }
						userCanManageModules={ this.props.userCanManageModules }
					/>
				) }
				{ ! showComposing && ! showPostByEmail && (
					<Card>
						{ __(
							'Writing tools available to you will be shown here when an administrator enables them.'
						) }
					</Card>
				) }
			</div>
		);
	}
}

export default connect( state => {
	return {
		module: module_name => getModule( state, module_name ),
		settings: getSettings( state ),
		masterbarIsAlwaysActive: isAtomicSite( state ),
		isDevMode: isDevMode( state ),
		isUnavailableInDevMode: module_name => isUnavailableInDevMode( state, module_name ),
		userCanEditPosts: userCanEditPosts( state ),
		isModuleActivated: module_name => isModuleActivated( state, module_name ),
		isLinked: isCurrentUserLinked( state ),
		userCanManageModules: userCanManageModules( state ),
		isModuleFound: module_name => isModuleFound( state, module_name ),
		connectUrl: getConnectUrl( state ),
		getModuleOverride: module_name => getModuleOverride( state, module_name ),
	};
} )( Writing );
