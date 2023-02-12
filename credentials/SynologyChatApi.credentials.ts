import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SynologyChatApi implements ICredentialType {
	name = 'synologyChatApi';
	displayName = 'Synology Chat API';
	properties: INodeProperties[] = [
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			default: '',
			placeholder: '',
			description: 'The ChatBot Token',
		},
		{
			displayName: 'Base Url',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://<IP-OR-URL>:<PORT>',
			description: 'The Synology Chat Url (including port)',
		},
		{
			displayName: 'Disable SSL Validation',
			name: 'ignoreSSLErrors',
			type: 'boolean',
			default: false,
			description: 'If set to true, all SSL errors will be ignored.',
		}
	];

	// @TODO: Ensure SSL validation can be ignored
	test: ICredentialTestRequest = {
		request: {
			baseURL: '{{$credentials.baseUrl}}',
			url: '/webapi/entry.cgi?api=SYNO.Chat.External&method=user_list&version=2',
		},
	};
}
