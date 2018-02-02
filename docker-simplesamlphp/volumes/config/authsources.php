<?php

$config = array(

	// This is a authentication source which handles admin authentication.
	'admin' => array(
		// The default is to use core:AdminPassword, but it can be replaced with
		// any authentication source.
		'core:AdminPassword',
	),

	// Example of a LDAP authentication source.
	'sdm-ldap' => array(
		'ldap:LDAP',
		// Give the user an option to save their username for future login attempts
		// And when enabled, what should the default be, to save the username or not
		//'remember.username.enabled' => FALSE,
		//'remember.username.checked' => FALSE,

		// The hostname of the LDAP server.
		'hostname' => 'ldap://' . getenv('LDAP_HOST') . '/',
		// Whether SSL/TLS should be used when contacting the LDAP server.
		'enable_tls' => FALSE,
		// Whether debug output from the LDAP library should be enabled.
		// Default is FALSE.
		'debug' => TRUE,
		// The timeout for accessing the LDAP server, in seconds.
		// The default is 0, which means no timeout.
		'timeout' => 30,
		// Set whether to follow referrals. AD Controllers may require FALSE to function.
		'referrals' => TRUE,
		// Which attributes should be retrieved from the LDAP server.
		// This can be an array of attribute names, or NULL, in which case
		// all attributes are fetched.
		//'attributes' => array('uid', 'sn', 'givenName', 'description'),
		'attributes' => array('cn', 'email'),
		// The pattern which should be used to create the users DN given the username.
		// %username% in this pattern will be replaced with the users username.
		//
		// This option is not used if the search.enable option is set to TRUE.
		'dnpattern' => 'uid=%username%,ou=people,dc=example,dc=org',

		// As an alternative to specifying a pattern for the users DN, it is possible to
		// search for the username in a set of attributes. This is enabled by this option.
		'search.enable' => TRUE,

		// The DN which will be used as a base for the search.
		// This can be a single string, in which case only that DN is searched, or an
		// array of strings, in which case they will be searched in the order given.
		'search.base' => getenv('LDAP_BASE'),

		// The attribute(s) the username should match against.
		//
		// This is an array with one or more attribute names. Any of the attributes in
		// the array may match the value the username.
		'search.attributes' => array('cn'),

		// The username & password the simpleSAMLphp should bind to before searching. If
		// this is left as NULL, no bind will be performed before searching.
		'search.username' => getenv('LDAP_BIND_DN'),
		'search.password' => getenv('LDAP_ADMIN_PASSWORD'),

		// If the directory uses privilege separation,
		// the authenticated user may not be able to retrieve
		// all required attribures, a privileged entity is required
		// to get them. This is enabled with this option.
		'priv.read' => FALSE,

		// The DN & password the simpleSAMLphp should bind to before
		// retrieving attributes. These options are required if
		// 'priv.read' is set to TRUE.
		'priv.username' => NULL,
		'priv.password' => NULL,

	),


	/*
	// Example of an LDAPMulti authentication source.
	'example-ldapmulti' => array(
		'ldap:LDAPMulti',

		// Give the user an option to save their username for future login attempts
		// And when enabled, what should the default be, to save the username or not
		//'remember.username.enabled' => FALSE,
		//'remember.username.checked' => FALSE,

		// The way the organization as part of the username should be handled.
		// Three possible values:
		// - 'none':   No handling of the organization. Allows '@' to be part
		//             of the username.
		// - 'allow':  Will allow users to type 'username@organization'.
		// - 'force':  Force users to type 'username@organization'. The dropdown
		//             list will be hidden.
		//
		// The default is 'none'.
		'username_organization_method' => 'none',

		// Whether the organization should be included as part of the username
		// when authenticating. If this is set to TRUE, the username will be on
		// the form <username>@<organization identifier>. If this is FALSE, the
		// username will be used as the user enters it.
		//
		// The default is FALSE.
		'include_organization_in_username' => FALSE,

		// A list of available LDAP servers.
		//
		// The index is an identifier for the organization/group. When
		// 'username_organization_method' is set to something other than 'none',
		// the organization-part of the username is matched against the index.
		//
		// The value of each element is an array in the same format as an LDAP
		// authentication source.
		'employees' => array(
			// A short name/description for this group. Will be shown in a dropdown list
			// when the user logs on.
			//
			// This option can be a string or an array with language => text mappings.
			'description' => 'Employees',

			// The rest of the options are the same as those available for
			// the LDAP authentication source.
			'hostname' => 'ldap.employees.example.org',
			'dnpattern' => 'uid=%username%,ou=employees,dc=example,dc=org',
		),

		'students' => array(
			'description' => 'Students',

			'hostname' => 'ldap.students.example.org',
			'dnpattern' => 'uid=%username%,ou=students,dc=example,dc=org',
		),

	),
	*/

);
