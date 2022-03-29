import './lib/init.js';

import LatestVersion from 'latest-version';

import StaffWock from '@hey/hey-staff-wock';

import PKG from './lib/global/package.js';
import C from './lib/global/config.js';
import G from './lib/global/log.js';


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
						tag: `v${major}`
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



const wockStaff = new StaffWock(
	C.target,
	PKG.name, C.auth.id,
	C.auth.who, C.auth.token,
	C.push.interval, staff,
	(...params) => G.info('Wock', '信息', ...params),
	(...params) => G.error('Wock', '错误', ...params),
);


wockStaff.add('auth-successful', () => G.info('~[Hey]通讯', '认证', '✔ '));
wockStaff.add('auth-failed', error => G.error('~[Hey]通讯', '认证', `✖ ${error.message ?? error}`));
wockStaff.add('staff-start', () => G.info('~[Hey]通讯', '开始~[工作]', '✔ '));
wockStaff.add('staff-stop', () => G.info('~[Hey]通讯', '停止~[工作]', '✔ '));

wockStaff.add('set-auth', (id, who, token) => C.$.edit('auth', auth => {
	G.info('~[Hey]通讯', '更新~[认证信息]', '✔ ',
		`~[id]~{${id}}`,
		`~[who]~{${who}}`,
		`~[token]~{${token}}`,
	);

	return { id, who, token };
}));


wockStaff.open();
