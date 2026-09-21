import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Default Seed Workspace ID (Sri's Workspace)
export const DEFAULT_WORKSPACE_ID = 
  import.meta.env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001';


/**
 * Data service methods partitioned strictly by workspace_id
 */

// 0. Ensure Workspace Row Exists in Supabase (prevents foreign key violation)
export const ensureWorkspaceExists = async (workspaceId, workspaceName = 'Client Workspace') => {
  if (!supabase || !workspaceId || workspaceId === DEFAULT_WORKSPACE_ID) return true;
  try {
    const { data: existing } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .maybeSingle();

    if (existing) return true;

    const safeSlug = (workspaceName || 'workspace')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 40);

    const { error: insertErr } = await supabase
      .from('workspaces')
      .insert([
        {
          id: workspaceId,
          organization_id: 'a0000000-0000-0000-0000-000000000001',
          name: workspaceName,
          slug: `${safeSlug}-${Date.now().toString(36)}`,
          plan: 'business',
          plan_status: 'active',
        },
      ]);

    if (insertErr && insertErr.code !== '23505') {
      console.warn('Could not auto-create workspace row in Supabase:', insertErr.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('ensureWorkspaceExists notice:', err.message);
    return false;
  }
};

// 1. Fetch Contacts
export const getContacts = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching contacts:', error);
    return null;
  }
  return data;
};

// 1b. Create New Contact in Database
export const createContact = async ({
  workspaceId = DEFAULT_WORKSPACE_ID,
  fullName,
  phoneNumber,
  email = null,
  leadStage = 'Discovery',
  leadScore = 60,
  source = 'manual_crm',
  city = 'Mumbai, IN',
  dealValue = '₹2,499',
  tag = 'Interested',
}) => {
  if (!supabase) return null;

  // Auto-ensure workspace row exists before inserting contact
  await ensureWorkspaceExists(workspaceId, `${fullName}'s Workspace`);

  // Insert Contact
  const { data: contact, error: contactErr } = await supabase
    .from('contacts')
    .insert([
      {
        workspace_id: workspaceId,
        full_name: fullName,
        phone_number: phoneNumber,
        email: email || null,
        lead_stage: leadStage,
        lead_score: leadScore,
        source: source,
        custom_attributes: {
          city,
          dealValue,
          tag,
        },
      },
    ])
    .select()
    .single();

  if (contactErr) {
    console.error('Error creating contact:', contactErr);
    throw contactErr;
  }

  // Create corresponding conversation thread in database
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .insert([
      {
        workspace_id: workspaceId,
        contact_id: contact.id,
        channel_id: 'd0000000-0000-0000-0000-000000000001',
        channel_type: 'whatsapp',
        status: 'open',
        unread_count: 0,
        last_message_text: `Contact created for ${fullName}`,
        last_message_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return { contact, conversation: conv };
};

// 1c. Delete Contact from Database
export const deleteContact = async (contactId, workspaceId = DEFAULT_WORKSPACE_ID, phoneNumber = null) => {
  if (!supabase) return false;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contactId);

  let query = supabase.from('contacts').delete().eq('workspace_id', workspaceId);

  if (isUuid) {
    query = query.eq('id', contactId);
  } else if (phoneNumber) {
    const clean = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    query = query.ilike('phone_number', `%${clean}%`);
  } else {
    console.log('Skipping Supabase delete for non-UUID local mock id with no phone:', contactId);
    return true;
  }

  const { error } = await query;

  if (error) {
    console.error('Error deleting contact from database:', error);
    throw error;
  }
  return true;
};

// 1d. Update Contact in Database
export const updateContact = async (contactId, updates, workspaceId = DEFAULT_WORKSPACE_ID, phoneNumber = null) => {
  if (!supabase) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contactId);

  const dbUpdates = {
    updated_at: new Date().toISOString(),
  };

  if (updates.fullName || updates.name) dbUpdates.full_name = updates.fullName || updates.name;
  if (updates.phoneNumber || updates.phone) dbUpdates.phone_number = updates.phoneNumber || updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email || null;
  if (updates.leadStage || updates.tag) dbUpdates.lead_stage = updates.leadStage || updates.tag;
  if (updates.custom_attributes) dbUpdates.custom_attributes = updates.custom_attributes;

  let query = supabase.from('contacts').update(dbUpdates).eq('workspace_id', workspaceId);

  if (isUuid) {
    query = query.eq('id', contactId);
  } else if (phoneNumber) {
    const clean = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    query = query.ilike('phone_number', `%${clean}%`);
  } else {
    console.log('Skipping Supabase update for non-UUID local mock id with no phone:', contactId);
    return null;
  }

  const { data, error } = await query.select().single();
  if (error) {
    console.error('Error updating contact in database:', error);
    throw error;
  }
  return data;
};


// 2. Fetch Connected Channels
export const getChannels = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('workspace_id', workspaceId);
  if (error) {
    console.error('Error fetching channels:', error);
    return null;
  }
  return data;
};

// 3. Fetch Conversations
export const getConversations = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('conversations')
    .select('id, contact_id, channel_id, channel_type, status, last_message_text, last_message_at, unread_count')
    .eq('workspace_id', workspaceId)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
  return data || [];
};

// 3b. Update Conversation Agent Status ('bot_active' | 'human_agent')
export const updateConversationStatus = async (conversationId, status = 'bot_active') => {
  if (!supabase || !conversationId) return null;
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', conversationId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Could not update conversation status in Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase update conversation status error:', err.message);
    return null;
  }
};

// 4. Fetch Messages for a specific conversation
export const getMessages = async (conversationId) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true });
  if (error) {
    console.error('Error fetching messages:', error);
    return null;
  }
  return data;
};

// 4b. Fetch all Messages for the workspace
export const getWorkspaceMessages = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('sent_at', { ascending: true });
  if (error) {
    console.error('Error fetching workspace messages:', error);
    return [];
  }
  return data || [];
};

// 5. Send an outbound message
export const sendChatMessage = async ({
  workspaceId = DEFAULT_WORKSPACE_ID,
  conversationId,
  channelId,
  senderType = 'agent',
  content,
  type = 'text',
}) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        workspace_id: workspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: senderType === 'ai',
        type,
        content,
        status: 'sent',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
};

// 6. Fetch Wallet Balance & Transaction History
export const getWalletData = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return null;
  const { data: wallet, error: walletErr } = await supabase
    .from('wallet_accounts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (walletErr) {
    console.error('Error fetching wallet:', walletErr);
    return null;
  }

  const { data: transactions, error: txErr } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    wallet,
    transactions: transactions || [],
  };
};

export const rechargeWalletSupabase = async (workspaceId = DEFAULT_WORKSPACE_ID, amountUsd = 10, paymentId = '', description = '') => {
  if (!supabase || !workspaceId) return null;
  try {
    const { data: currentWallet } = await supabase
      .from('wallet_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    const currentBal = currentWallet ? parseFloat(currentWallet.balance_usd) || 0 : 0;
    const newBal = +(currentBal + (parseFloat(amountUsd) || 0)).toFixed(4);

    if (currentWallet) {
      await supabase
        .from('wallet_accounts')
        .update({ balance_usd: newBal, updated_at: new Date().toISOString() })
        .eq('workspace_id', workspaceId);
    } else {
      await supabase
        .from('wallet_accounts')
        .insert([{ workspace_id: workspaceId, balance_usd: newBal }]);
    }

    await supabase.from('wallet_transactions').insert([
      {
        workspace_id: workspaceId,
        type: 'credit',
        amount_usd: parseFloat(amountUsd) || 0,
        balance_after_usd: newBal,
        description: description || `AI Credits Recharge via Razorpay (${paymentId})`,
        reference_id: paymentId,
      },
    ]);

    return newBal;
  } catch (err) {
    console.warn('[Supabase Wallet] Note updating wallet in cloud:', err.message);
    return null;
  }
};

// 7. Subscribe to real-time inbound events via persistent WebSocket
export const subscribeToWorkspaceRealtime = (workspaceId, handlers = {}) => {
  if (!supabase || !workspaceId) return null;

  // Support both functional callback: subscribeToWorkspaceRealtime(wsId, cb)
  // and handlers object: subscribeToWorkspaceRealtime(wsId, { onNewMessage, onContactChange, ... })
  const onNewMessage = typeof handlers === 'function' ? handlers : handlers.onNewMessage;
  const onContactChange = handlers.onContactChange;
  const onConversationChange = handlers.onConversationChange;
  const onWalletChange = handlers.onWalletChange;
  const onChannelChange = handlers.onChannelChange;

  const channelId = `realtime_ws_${workspaceId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const channel = supabase.channel(channelId);

  // 1. Inbound & Outbound Messages WebSocket Stream
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `workspace_id=eq.${workspaceId}`,
    },
    (payload) => {
      if (onNewMessage) {
        onNewMessage(payload.new || payload.old);
      }
    }
  );

  // 2. Contacts Changes WebSocket Stream (Add / Update / Delete)
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'contacts',
      filter: `workspace_id=eq.${workspaceId}`,
    },
    (payload) => {
      if (onContactChange) onContactChange(payload);
    }
  );

  // 3. Conversation Thread Status & Activity
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'conversations',
      filter: `workspace_id=eq.${workspaceId}`,
    },
    (payload) => {
      if (onConversationChange) onConversationChange(payload);
    }
  );

  // 4. Wallet Balance & Transaction Live Stream
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'wallet_accounts',
      filter: `workspace_id=eq.${workspaceId}`,
    },
    (payload) => {
      if (onWalletChange) onWalletChange(payload.new);
    }
  );

  // 5. Channel Connections Live Stream
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'channels',
      filter: `workspace_id=eq.${workspaceId}`,
    },
    (payload) => {
      if (onChannelChange) onChannelChange(payload.new);
    }
  );

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`⚡ [WebSocket] Connected to Supabase Realtime channel for workspace "${workspaceId}"`);
    }
  });

  return channel;
};

// Backward-compatible alias
export const subscribeToNewMessages = subscribeToWorkspaceRealtime;

// 8. Templates & Auto-Replies
export const getTemplates = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
  return data || [];
};

export const createTemplate = async ({
  name,
  body_text,
  footer_text = '',
  category = 'utility',
  status = 'approved',
  header_type = null,
  header_content = null,
  workspaceId = DEFAULT_WORKSPACE_ID,
}) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('templates')
    .insert([
      {
        workspace_id: workspaceId,
        name,
        category,
        language: 'en_US',
        status,
        header_type,
        header_content,
        body_text,
        footer_text,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    throw error;
  }
  return data;
};

export const updateTemplate = async (templateId, updates) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating template:', error);
    throw error;
  }
  return data;
};

export const deleteTemplate = async (templateId, workspaceId = null) => {
  if (!supabase) return false;
  let query = supabase.from('templates').delete().eq('id', templateId);
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  const { error } = await query;

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
  return true;
};

// 9. Broadcast Campaigns (Cloud Persistence)
export const getCampaigns = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getCampaigns note:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
};

// 10. Drip Campaigns (Cloud Persistence)
export const getDripCampaigns = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drip_campaigns')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      return null;
    }
    return data || [];
  } catch (err) {
    return null;
  }
};

// 11. Automations (Cloud Persistence)
export const getAutomations = async (workspaceId = DEFAULT_WORKSPACE_ID) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      return null;
    }
    return data || [];
  } catch (err) {
    return null;
  }
};


