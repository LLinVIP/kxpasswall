function main(config) {
    // 1. 从“香港节点”策略组中移除包含“GAME”字样的节点
    const hkGroup = config['proxy-groups']?.find(group => group.name === '香港节点');
    if (hkGroup && hkGroup.proxies) {
      hkGroup.proxies = hkGroup.proxies.filter(proxyName => !proxyName.includes('GAME'));
    }

    // 1.1 删除部分规则组（以及其对应的路由规则引用）
    const groupsToRemove = ['Spotify', 'Bahamut', 'PikPak', 'E-Hentai'];
    if (Array.isArray(config['proxy-groups'])) {
      config['proxy-groups'] = config['proxy-groups'].filter(group => !groupsToRemove.includes(group?.name));
    }

    const rulesToRemove = new Set([
      'GEOSITE,SPOTIFY,Spotify',
      'GEOSITE,BAHAMUT,Bahamut',
      'GEOSITE,PIKPAK,PikPak',
      'RULE-SET,EHentai,E-Hentai',
    ]);
    if (Array.isArray(config.rules)) {
      config.rules = config.rules.filter(ruleLine => {
        if (typeof ruleLine !== 'string') return true;
        return !rulesToRemove.has(ruleLine.trim());
      });
    }
  
    // 2. 注入基于 jsDelivr 的 Rule Provider (远程规则集)
    // 如果基础模板没有 rule-providers 字段，我们先初始化它
    if (!config['rule-providers']) {
      config['rule-providers'] = {};
    }
    
    // 定义你的英国专属规则集
    config['rule-providers']['Custom_UK_Rules'] = {
      type: 'http',
      behavior: 'classical',
      format: 'text', // 🌟 新增：明确告诉客户端这是纯文本格式
      url: 'https://gcore.jsdelivr.net/gh/LLinVIP/kxpasswall@main/uk_rules.list',
      path: './ruleset/custom_uk_rules.list',
      interval: 86400
    };
  
    // 定义你的直连专属规则集
    config['rule-providers']['Custom_Direct_Rules'] = {
      type: 'http',
      behavior: 'classical',
      format: 'text', // 🌟 新增：明确告诉客户端这是纯文本格式
      url: 'https://gcore.jsdelivr.net/gh/LLinVIP/kxpasswall@main/direct.list',
      path: './ruleset/custom_direct_rules.list',
      interval: 86400
    };
  
    // 3. 插入路由规则
    // 注意：将刚刚定义的远程规则集，分别指向对应的策略
    config.rules.unshift(
      "RULE-SET,Custom_Direct_Rules,DIRECT", // 将直连规则集指向 DIRECT
      "RULE-SET,Custom_UK_Rules,英国节点"     // 将英国规则集指向 英国节点
    );
  
    return config;
  }