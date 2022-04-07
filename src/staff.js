import LatestVersion from 'latest-version';

import C from '../lib/global/config.js';
import G from '../lib/global/log.js';


if(!C.version) { C.$.edit('version', () => ({})); }


const staff = async hey => {
	for(const pack in C.push.package) {
		if(!C.version[pack]) { C.$.edit('version', packagesAll => (packagesAll[pack] = {}) && void 0); }


		for(const major of C.push.package[pack]) {
			if(!C.version[pack][major]) { C.$.edit('version', packagesAll => (packagesAll[pack][major] = []) && void 0); }


			try {
				const version = await LatestVersion(pack, { version: `^${major}` });


				if(!C.version[pack][major].includes(version)) {
					C.$.edit('version', packagesAll => packagesAll[pack][major].unshift(version) && void 0);


					G.info('士大夫', `~[${pack}] v${major}.x`, `✔ 发现新~[版本]~{v${version}}`);


					hey({
						title: `${pack} 有新版本啦！`,
						body: `v${version}`,
						data: `https://www.npmjs.com/package/${pack}`,
						tag: `${pack} v${major}`
					});
				}
				else {
					G.info('士大夫', `~[${pack}] v${major}.x`, `○ 暂无新~[版本]`);
				}
			}
			catch(error) {
				if(error?.name == 'VersionNotFoundError') {
					G.warn('士大夫', `~[${pack}] v${major}.x`, `✖ 该主线暂无~[版本]`);
				}
				else {
					G.error('士大夫', `~[${pack}] v${major}.x`, `✖ ${error?.message ?? error}`);
				}
			}
		}
	}
};


export default staff;
