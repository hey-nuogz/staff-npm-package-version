import './lib/init.js';

import { publicEncrypt } from 'crypto';

import Axios from 'axios';
import LatestVersion from 'latest-version';

import C from './lib/global/config.js';
import G from './lib/global/log.js';
import PKG from './lib/global/package.js';


if(!~~C.interval || ~~C.interval < 1000) { throw Error('间隔无效或小于一秒'); }


const hey = async push => {
	try {
		const { data: result } = await Axios.post(`http://${C.target.host}:${C.target.port}/api/hey/push`, {
			from: publicEncrypt(
				C.publicKey.from,
				Buffer.from(JSON.stringify({ who: C.id, app: PKG.name, }))
			).toString('base64'),

			data: publicEncrypt(
				C.publicKey.data,
				Buffer.from(JSON.stringify(push))
			).toString('base64')
		}, { timeout: 1000 * 30 });


		if(result?.success) {
			G.info('主线', '推送~[通知]', `✔ `);
		}
		else {
			throw Error(result?.message);
		}
	}
	catch(error) {
		G.error('主线', '推送~[通知]', `✖ ${error?.message ?? error}`);
	}
};


const run = async () => {
	const versionsNew = [];

	for(const major of Object.keys(C.version)) {
		try {
			const version = await LatestVersion('pnpm', { version: `^${major}` });


			if(version && !C.version[major].includes(version)) {
				versionsNew.unshift(version);

				hey({
					title: `嘿！pnpm 有新版本啦！`,
					body: `v${version}`,
					data: 'https://www.npmjs.com/package/pnpm',
					tag: `${PKG.name} v${major}`
				});

				C.__edit('version', versions => versions[major].unshift(version));

				G.info('主线', '监视PNPM版本', `✔ 发现新~[版本]~{v${version}}`);
			}
		}
		catch(error) {
			G.error('主线', '监视PNPM版本', `✖ ${error?.message ?? error}`);
		}
	}

	if(versionsNew.length) {
		G.info('主线', '监视PNPM版本', `✔ 发现新~[版本]`, ...versionsNew.map(version => `~{v${version}}`));
	}
	else {
		G.info('主线', '监视PNPM版本', `○ 暂未新~[版本]`);
	}
};



run();
setInterval(run, C.interval);
