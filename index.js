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
			G.debug('主线', '推送', `✔ `);
		}
		else {
			throw Error(result?.message);
		}
	}
	catch(error) {
		G.error('主线', '推送', `✖ ${error?.message ?? error}`);
	}
};


const run = async () => {
	for(const namePackage of Object.keys(C.version)) {
		const majors = C.version[namePackage];

		for(const major in majors) {
			try {
				const version = await LatestVersion(namePackage, { version: `^${major}` });

				if(!majors[major].includes(version)) {
					hey({
						title: `嘿！${namePackage} 有新版本啦！`,
						body: `v${version}`,
						data: `https://www.npmjs.com/package/${namePackage}`,
						tag: `${PKG.name} ${namePackage} v${major}`
					});


					C.__edit('version', packages => packages[namePackage][major].unshift(version));


					G.info('士大夫', `~[${namePackage}] v${major}.x`, `✔ 发现新~[版本]~{v${version}}`);
				}
				else {
					G.info('士大夫', `~[${namePackage}] v${major}.x`, `○ 暂无新~[版本]`);
				}
			}
			catch(error) {
				if(error?.name == 'VersionNotFoundError') {
					G.warn('士大夫', `~[${namePackage}] v${major}.x`, `✖ 该主线暂无~[版本]`);
				}
				else {
					G.error('士大夫', `~[${namePackage}] v${major}.x`, `✖ ${error?.message ?? error}`);
				}
			}
		}
	}
};



run();
setInterval(run, C.interval);
