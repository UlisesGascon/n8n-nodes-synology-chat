// @ts-ignore
import synologyChatCommunicator from 'synology-chat-communicator';

import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class SynologyChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Synology Chat',
		name: 'SynologyChat',
		icon: 'file:SynologyChat.svg',
		group: ['communication'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Synology Chat API',
		defaults: {
			name: 'SynologyChat',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'synologyChatApi',
				required: false,
			},
		],

		requestDefaults: {
			baseURL: '{{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},

		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send Message',
						value: 'sendMessage',
					}
				],
				default: 'sendMessage',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				default: '',
				placeholder: '',
				description: 'The destination User ID',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: 'Hello World!',
				placeholder: 'Hello World!',
				description: 'The Text to send',
			},
			{
				displayName: 'Media Link',
				name: 'mediaLink',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.png',
				description: 'The Media resource to attach',
			},

		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const { token, baseUrl, ignoreSSLErrors } = await this.getCredentials('synologyChatApi')
		const { sendDirectMessage } = synologyChatCommunicator({token, baseUrl, ignoreSSLErrors})

		let item: INodeExecutionData;
		let operation: string;
		let userId: number;
		let text: string;
		let mediaLink: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				operation = this.getNodeParameter('operation', itemIndex, '') as string;
				userId = this.getNodeParameter('userId', itemIndex, 0) as number;
				text = this.getNodeParameter('text', itemIndex, '') as string;
				mediaLink = this.getNodeParameter('mediaLink', itemIndex, '') as string;
			
				item = items[itemIndex];

				item.json['operation'] = operation;
				item.json['userId'] = userId;
				item.json['text'] = text;
				item.json['mediaLink'] = mediaLink;
				if(operation === 'sendMessage'){
					item.json['response'] = await sendDirectMessage(userId, text, mediaLink)
				}
				
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return this.prepareOutputData(items);
	}
}
