-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
	vim.fn.system({
		"git",
		"clone",
		"--filter=blob:none",
		"https://github.com/folke/lazy.nvim.git",
		"--branch=stable",
		lazypath,
	})
end
vim.opt.rtp:prepend(lazypath)

-- Options
vim.opt.number = true
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.softtabstop = 2
vim.opt.expandtab = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.hlsearch = true
vim.opt.incsearch = true
vim.opt.scrolloff = 3
vim.opt.wrap = true
vim.opt.encoding = "utf-8"
vim.opt.hidden = true
vim.opt.visualbell = true
vim.opt.ruler = true
vim.opt.laststatus = 2
vim.opt.showmode = true
vim.opt.showcmd = true
vim.opt.backspace = "indent,eol,start"
vim.opt.modelines = 0
vim.opt.matchpairs:append("<:>")

-- Keymaps
vim.keymap.set("n", "j", "gj")
vim.keymap.set("n", "k", "gk")
vim.keymap.set("i", "jk", "<ESC>")
vim.keymap.set("n", "TT", "ZZ")
vim.keymap.set("n", "<Up>", "<Nop>")
vim.keymap.set("n", "<Down>", "<Nop>")
vim.keymap.set("n", "<Left>", "<Nop>")
vim.keymap.set("n", "<Right>", "<Nop>")
vim.keymap.set("n", "<leader><space>", ":let @/=''<CR>")
vim.keymap.set("n", "<leader>q", "gqip")
vim.keymap.set("n", "<leader>l", ":set list!<CR>")

vim.opt.listchars = { tab = "▸ ", eol = "¬" }

-- Plugins
require("lazy").setup({
	{
		"nvim-treesitter/nvim-treesitter",
		lazy = false,
		build = ":TSUpdate",
		config = function()
			require("nvim-treesitter").setup({})
			require("nvim-treesitter").install({ "javascript", "typescript", "tsx" })

			vim.api.nvim_create_autocmd("FileType", {
				pattern = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
				callback = function()
					pcall(vim.treesitter.start)
				end,
			})
		end,
	},
	{ "kylechui/nvim-surround", event = "VeryLazy", opts = {} },
	{
		"numToStr/Comment.nvim",
		opts = {
			-- add any options here
		},
	},
})
