'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Image as ImageIcon, List as ListIcon, ListOrdered, Quote as QuoteIcon, Code as CodeIcon } from 'lucide-react'

interface RichTextEditorProps {
  placeholder?: string
  initialValue?: string
  onChange?: (content: string) => void
  onReady?: () => void
  className?: string
  minHeight?: string
}

export default function RichTextEditor({
  placeholder = 'Start writing...',
  initialValue = '',
  onChange,
  onReady,
  className = '',
  minHeight = '200px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [content, setContent] = useState(initialValue)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue
      setIsReady(true)
      if (onReady) onReady()
    }
  }, [])

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand('insertText', false, emoji)
    }
  }

  const formatText = (action: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand(action, false)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url && editorRef.current) {
      editorRef.current.focus()
      document.execCommand('createLink', false, url)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url && editorRef.current) {
      editorRef.current.focus()
      document.execCommand('insertImage', false, url)
    }
  }

  const insertQuote = () => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand('formatBlock', false, 'blockquote')
    }
  }

  const insertCode = () => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand('formatBlock', false, 'pre')
    }
  }

  const getData = (): string => {
    return content
  }

  const setData = (data: string) => {
    setContent(data)
    if (editorRef.current) {
      editorRef.current.innerHTML = data
    }
  }

  const clearEditor = () => {
    setContent('')
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
    }
  }

  // Expose methods to parent component
  useEffect(() => {
    if (editorRef.current) {
      (editorRef.current as any).editorMethods = {
        getData,
        setData,
        clearEditor
      }
    }
  }, [isReady, content])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML
    setContent(newContent)
    if (onChange) {
      onChange(newContent)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          formatText('bold')
          break
        case 'i':
          e.preventDefault()
          formatText('italic')
          break
        case 'u':
          e.preventDefault()
          formatText('underline')
          break
      }
    }
  }

  const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="border border-gray-600 rounded-t-lg p-3 bg-gray-800 flex flex-wrap gap-2 items-center">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-600 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            title="Bold (Ctrl+B)"
            className="p-1 h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            title="Italic (Ctrl+I)"
            className="p-1 h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('underline')}
            title="Underline (Ctrl+U)"
            className="p-1 h-8 w-8"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('strikeThrough')}
            title="Strikethrough"
            className="p-1 h-8 w-8"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-600 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('insertUnorderedList')}
            title="Bullet List"
            className="p-1 h-8 w-8"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('insertOrderedList')}
            title="Numbered List"
            className="p-1 h-8 w-8"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-600 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('justifyLeft')}
            title="Align Left"
            className="p-1 h-8 w-8"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('justifyCenter')}
            title="Align Center"
            className="p-1 h-8 w-8"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('justifyRight')}
            title="Align Right"
            className="p-1 h-8 w-8"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Insert Options */}
        <div className="flex gap-1 border-r border-gray-600 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertLink}
            title="Insert Link"
            className="p-1 h-8 w-8"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertImage}
            title="Insert Image"
            className="p-1 h-8 w-8"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertQuote}
            title="Quote"
            className="p-1 h-8 w-8"
          >
            <QuoteIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertCode}
            title="Code Block"
            className="p-1 h-8 w-8"
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Emoji Picker */}
        <div className="flex gap-1">
          <details className="relative">
            <summary className="cursor-pointer p-1 h-8 rounded text-gray-300 hover:bg-gray-700 list-none">
              😀
            </summary>
            <div className="absolute top-10 left-0 z-50 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
              <div className="grid grid-cols-8 gap-1 max-w-64 max-h-48 overflow-y-auto">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-gray-700 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Editor Container */}
      <div 
        ref={editorRef}
        className="border border-gray-600 border-t-0 rounded-b-lg bg-gray-900 text-white prose prose-invert max-w-none p-4 focus:outline-none"
        style={{ minHeight }}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
      />

      {/* CSS for placeholder */}
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>

      {/* Status indicator */}
      {!isReady && (
        <div className="text-xs text-gray-400 mt-2">
          Loading editor...
        </div>
      )}
    </div>
  )
} 