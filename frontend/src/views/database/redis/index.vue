<template>
    <div v-loading="loading">
        <LayoutContent :title="'Redis ' + $t('menu.database')">
            <template #app>
                <AppStatus
                    :app-key="'redis'"
                    v-model:loading="loading"
                    @before="onBefore"
                    @setting="onSetting"
                    @is-exist="checkExist"
                ></AppStatus>
            </template>
            <template #toolbar v-if="!isOnSetting && redisIsExist">
                <div :class="{ mask: redisStatus != 'Running' }">
                    <el-button type="primary" plain @click="goDashboard" icon="Position">Redis-Commander</el-button>
                    <el-button type="primary" plain @click="onChangePassword">
                        {{ $t('database.changePassword') }}
                    </el-button>
                </div>
            </template>
            <template #main v-if="redisIsExist && !isOnSetting">
                <Terminal :key="isRefresh" ref="terminalRef" />
            </template>
        </LayoutContent>

        <el-card width="30%" v-if="redisStatus != 'Running' && !isOnSetting && redisIsExist" class="mask-prompt">
            <span>{{ $t('commons.service.serviceNotStarted', ['Redis']) }}</span>
        </el-card>

        <Setting ref="settingRef" style="margin-top: 30px" />
        <Password ref="passwordRef" @check-exist="initTerminal" @close-terminal="closeTerminal(true)" />
        <el-dialog
            v-model="commandVisiable"
            :title="$t('app.checkTitle')"
            width="30%"
            :close-on-click-modal="false"
            :destroy-on-close="true"
        >
            <el-alert :closable="false" :title="$t('app.checkInstalledWarn', ['Redis-Commander'])" type="info">
                <el-link icon="Position" @click="getAppDetail('redis-commander')" type="primary">
                    {{ $t('database.goInstall') }}
                </el-link>
            </el-alert>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="commandVisiable = false">{{ $t('commons.button.cancel') }}</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import LayoutContent from '@/layout/layout-content.vue';
import Setting from '@/views/database/redis/setting/index.vue';
import Password from '@/views/database/redis/password/index.vue';
import Terminal from '@/views/database/redis/terminal/index.vue';
import AppStatus from '@/components/app-status/index.vue';
import { nextTick, onBeforeUnmount, ref } from 'vue';
import { App } from '@/api/interface/app';
import { GetAppPort } from '@/api/modules/app';
import router from '@/routers';

const loading = ref(false);

const terminalRef = ref();
const settingRef = ref();
const isOnSetting = ref(false);
const redisIsExist = ref(false);
const redisStatus = ref();
const redisName = ref();

const redisCommandPort = ref();
const commandVisiable = ref(false);

const isRefresh = ref();

const onSetting = async () => {
    isOnSetting.value = true;
    terminalRef.value?.onClose(false);
    settingRef.value!.acceptParams({ status: redisStatus.value, redisName: redisName.value });
};

const goDashboard = async () => {
    if (redisCommandPort.value === 0) {
        commandVisiable.value = true;
        return;
    }
    let href = window.location.href;
    let ipLocal = href.split('//')[1].split(':')[0];
    window.open(`http://${ipLocal}:${redisCommandPort.value}`, '_blank');
};
const getAppDetail = (key: string) => {
    router.push({ name: 'AppDetail', params: { appKey: key } });
};

const loadDashboardPort = async () => {
    const res = await GetAppPort('redis-commander');
    redisCommandPort.value = res.data;
};

const passwordRef = ref();
const onChangePassword = async () => {
    passwordRef.value!.acceptParams();
};

const checkExist = (data: App.CheckInstalled) => {
    redisIsExist.value = data.isExist;
    redisName.value = data.name;
    redisStatus.value = data.status;
    loading.value = false;
    if (redisStatus.value === 'Running') {
        loadDashboardPort();
        nextTick(() => {
            terminalRef.value.acceptParams();
        });
    }
};

const initTerminal = async () => {
    if (redisStatus.value === 'Running') {
        terminalRef.value.acceptParams();
    }
};
const closeTerminal = async (isKeepShow: boolean) => {
    isRefresh.value = !isRefresh.value;
    terminalRef.value?.onClose(isKeepShow);
};

const onBefore = () => {
    closeTerminal(true);
};
onBeforeUnmount(() => {
    closeTerminal(false);
});
</script>
