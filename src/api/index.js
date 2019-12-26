// api接口
import axios from 'axios';
import Qs from 'qs';
/* eslint-disable */

let api = {
    postc(params) {
        let postData = Qs.stringify(params)
        return axios.post('http://flow.browser.360.cn/mp.php', postData)
    },

    // 获取孩子详情
    getc(params) {
        return axios.get('/api/v1/children_detail', params)
    },

}

export default api